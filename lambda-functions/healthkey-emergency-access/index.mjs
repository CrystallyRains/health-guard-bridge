import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { randomUUID } from "crypto";

const db        = new DynamoDBClient({});
const bedrock   = new BedrockRuntimeClient({ region: "us-east-1" });
const sns       = new SNSClient({});
const translate = new TranslateClient({ region: "ap-south-1" });

const LANG_CODES = { EN: "en", HI: "hi", MR: "mr", TA: "ta", TE: "te" };

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { healthKeyId, doctorName, hospitalName, purpose = "Emergency Treatment", preferredLang = "EN" } = body;

    if (!healthKeyId || !doctorName || !hospitalName) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "healthKeyId, doctorName, hospitalName required" }) };
    }

    // 1. Fetch patient
    const result = await db.send(new GetItemCommand({
      TableName: "healthkey-patients",
      Key: { healthKeyId: { S: healthKeyId } },
    }));
    if (!result.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Patient not found." }) };
    }

    const p = result.Item;
    const privacyToggles    = JSON.parse(p.privacyToggles?.S    || "{}");
    const emergencyContacts = JSON.parse(p.emergencyContacts?.S || "[]");

    // 2. Build consented data
    const consentedData = {
      name:        p.name?.S   || "Unknown",
      blood:       p.blood?.S  || "Unknown",
      age:         p.age?.N    || "Unknown",
      gender:      p.gender?.S || "Unknown",
      allergies:   privacyToggles.allergies   !== false ? JSON.parse(p.allergies?.S   || "[]") : [],
      medications: privacyToggles.medications !== false ? JSON.parse(p.medications?.S || "[]") : [],
      conditions:  privacyToggles.conditions  !== false ? JSON.parse(p.conditions?.S  || "[]") : [],
      surgeries:   privacyToggles.surgeries   !== false ? JSON.parse(p.surgeries?.S   || "[]") : [],
    };

    const documents    = p.documents?.L || [];
    const docExtracted = documents.map(d => { try { return JSON.parse(d.M?.extracted?.S || "{}"); } catch { return {}; } }).filter(d => Object.keys(d).length > 0);

    // 3. Bedrock — detailed clinical summary
    const bedrockPrompt = `You are a senior emergency room physician AI assistant in India.
A doctor urgently needs a detailed clinical summary for a patient who may be unconscious.

Patient Data:
- Name: ${consentedData.name}, Age: ${consentedData.age}, Gender: ${consentedData.gender}
- Blood Group: ${consentedData.blood}
- Known Allergies: ${consentedData.allergies.join(", ") || "None recorded"}
- Current Medications: ${consentedData.medications.join(", ") || "None recorded"}
- Medical Conditions: ${consentedData.conditions.join(", ") || "None recorded"}
- Recent Surgeries: ${consentedData.surgeries.length > 0 ? JSON.stringify(consentedData.surgeries) : "None recorded"}

Data from uploaded medical documents:
${docExtracted.length > 0 ? docExtracted.map((d, i) => `Document ${i+1}: ${JSON.stringify(d)}`).join("\n") : "No documents uploaded."}

Purpose: ${purpose}

Return ONLY this JSON object, no text outside it:
{
  "criticalAlert": "2-3 sentence urgent alert covering the most critical risks — allergy dangers, active conditions, contraindications the doctor must know before treating",
  "allergies": ["each allergy with reaction type e.g. Penicillin — Anaphylaxis (severe)"],
  "medications": ["each with dosage and frequency e.g. Metformin 500mg — twice daily with food"],
  "conditions": ["each with clinical status e.g. Type 2 Diabetes Mellitus — poorly controlled, HbA1c 7.8%"],
  "surgeries": ["each with date and location e.g. Appendectomy — March 2021, Lilavati Hospital Mumbai"],
  "bloodGroup": "full blood group",
  "labHighlights": "key abnormal lab values if available from documents",
  "drugContraindications": "specific drug classes to strictly avoid with reasons",
  "emergencyNotes": "3-4 sentence clinical narrative of overall health status, key risks in this emergency, and recommended immediate precautions",
  "dataSources": ["patient-entered", "document-extracted"]
}`;

    const bedrockResp = await bedrock.send(new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [{ role: "user", content: bedrockPrompt }],
      }),
    }));

    const bedrockText = JSON.parse(new TextDecoder().decode(bedrockResp.body)).content[0].text;
    let summary = {};
    try {
      const jsonMatch = bedrockText.match(/\{[\s\S]*\}/);
      summary = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
      console.warn("Bedrock parse error:", e.message);
      summary = {
        criticalAlert: `URGENT: Patient ${consentedData.name} has known allergies to ${consentedData.allergies.join(", ") || "unknown allergens"}. Active conditions: ${consentedData.conditions.join(", ") || "none recorded"}. Blood group: ${consentedData.blood}.`,
        allergies: consentedData.allergies,
        medications: consentedData.medications,
        conditions: consentedData.conditions,
        surgeries: consentedData.surgeries,
        bloodGroup: consentedData.blood,
        labHighlights: "Not available",
        drugContraindications: consentedData.allergies.length > 0 ? `Avoid: ${consentedData.allergies.join(", ")} and related compounds` : "None recorded",
        emergencyNotes: `Patient has ${consentedData.conditions.join(" and ") || "no recorded conditions"}. Blood group ${consentedData.blood}.`,
        dataSources: ["patient-entered"],
      };
    }

    // 4. Translate all fields if language is not English
    if (preferredLang !== "EN" && LANG_CODES[preferredLang]) {
      const tl = LANG_CODES[preferredLang];

      const tf = async (text) => {
        if (!text || text === "None recorded" || text === "Not available") return text;
        try {
          const r = await translate.send(new TranslateTextCommand({
            Text: String(text).slice(0, 5000),
            SourceLanguageCode: "en",
            TargetLanguageCode: tl,
          }));
          return r.TranslatedText;
        } catch (e) {
          console.warn("Translate field error:", e.message);
          return text;
        }
      };

      const ta = async (arr) => {
        if (!Array.isArray(arr) || arr.length === 0) return arr;
        return Promise.all(arr.map(i => tf(String(i))));
      };

      const [tCritical, tAllergies, tMeds, tConditions, tSurgeries, tLab, tDrug, tNotes] = await Promise.all([
        tf(summary.criticalAlert),
        ta(summary.allergies),
        ta(summary.medications),
        ta(summary.conditions),
        ta(summary.surgeries),
        tf(summary.labHighlights),
        tf(summary.drugContraindications),
        tf(summary.emergencyNotes),
      ]);

      summary = {
        ...summary,
        criticalAlert:         tCritical,
        allergies:             tAllergies,
        medications:           tMeds,
        conditions:            tConditions,
        surgeries:             tSurgeries,
        labHighlights:         tLab,
        drugContraindications: tDrug,
        emergencyNotes:        tNotes,
        translatedTo:          preferredLang,
      };
    }

    // 5. SNS notifications
    const accessTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const sessionId  = randomUUID();

    for (const contact of emergencyContacts) {
      if (contact.phone) {
        try {
          const phone = contact.phone.startsWith("+") ? contact.phone : `+91${contact.phone.replace(/\D/g, "")}`;
          await sns.send(new PublishCommand({
            PhoneNumber: phone,
            Message: `HealthKey Alert: Dr. ${doctorName} at ${hospitalName} accessed ${consentedData.name}'s medical summary for "${purpose}" at ${accessTime} IST. Session: ${sessionId.slice(0,8).toUpperCase()}. Contact support if unexpected.`,
          }));
        } catch (e) {
          console.warn(`SNS failed:`, e.message);
        }
      }
    }

    // 6. Audit log
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    await db.send(new PutItemCommand({
      TableName: "healthkey-audit-log",
      Item: {
        sessionId:    { S: sessionId },
        healthKeyId:  { S: healthKeyId },
        doctorName:   { S: doctorName },
        hospitalName: { S: hospitalName },
        purpose:      { S: purpose },
        accessedAt:   { S: new Date().toISOString() },
        expiresAt:    { S: expiresAt },
        summaryShown: { S: JSON.stringify(summary) },
        status:       { S: "ACTIVE" },
        ttl:          { N: String(Math.floor(Date.now() / 1000) + 7200) },
      },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId, patientName: consentedData.name, expiresAt, sessionDurationMinutes: 30, summary, message: "Emergency access granted. Family notified." }),
    };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
