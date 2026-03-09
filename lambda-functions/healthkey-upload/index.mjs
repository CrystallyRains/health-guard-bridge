import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { TextractClient, StartDocumentTextDetectionCommand, GetDocumentTextDetectionCommand } from "@aws-sdk/client-textract";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient, UpdateItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const REGION   = "us-east-1";
const s3        = new S3Client({ region: REGION });
const textract  = new TextractClient({ region: REGION });
const translate = new TranslateClient({ region: REGION });
const bedrock   = new BedrockRuntimeClient({ region: REGION });
const db        = new DynamoDBClient({ region: REGION });

const BUCKET = process.env.S3_BUCKET;

// Poll Textract async job until complete (max 45 seconds)
const waitForTextract = async (jobId) => {
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 3000)); // wait 3s between polls
    const result = await textract.send(new GetDocumentTextDetectionCommand({ JobId: jobId }));
    if (result.JobStatus === "SUCCEEDED") {
      return (result.Blocks || [])
        .filter(b => b.BlockType === "LINE")
        .map(b => b.Text)
        .join("\n");
    }
    if (result.JobStatus === "FAILED") {
      throw new Error("Textract job failed: " + result.StatusMessage);
    }
    // Still IN_PROGRESS, keep polling
  }
  throw new Error("Textract timed out after 45 seconds");
};

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { healthKeyId, fileName, fileBase64, contentType = "application/pdf" } = body;

    if (!healthKeyId || !fileBase64 || !fileName) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "healthKeyId, fileName and fileBase64 required" }) };
    }

    // 1. Verify patient exists
    const patient = await db.send(new GetItemCommand({
      TableName: "healthkey-patients",
      Key: { healthKeyId: { S: healthKeyId } },
    }));
    if (!patient.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Patient not found" }) };
    }

    // 2. Upload to S3
    const fileBuffer = Buffer.from(fileBase64, "base64");
    const s3Key = `documents/${healthKeyId}/${randomUUID()}-${fileName}`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: "application/pdf",
    }));
    console.log("✓ S3 upload success:", s3Key);

    // 3. Textract async (supports multi-page PDFs)
    let rawText = "";
    try {
      const startResult = await textract.send(new StartDocumentTextDetectionCommand({
        DocumentLocation: { S3Object: { Bucket: BUCKET, Name: s3Key } },
      }));
      console.log("✓ Textract job started:", startResult.JobId);
      rawText = await waitForTextract(startResult.JobId);
      console.log("✓ Textract complete, chars:", rawText.length);
    } catch (e) {
      console.warn("⚠ Textract failed (non-fatal):", e.message);
    }

    // 4. Translate to English
    let englishText = rawText;
    let detectedLang = "en";
    if (rawText.length > 20) {
      try {
        const translated = await translate.send(new TranslateTextCommand({
          Text: rawText.slice(0, 5000),
          SourceLanguageCode: "auto",
          TargetLanguageCode: "en",
        }));
        englishText = translated.TranslatedText;
        detectedLang = translated.AppliedSourceLanguageCode || "en";
        console.log("✓ Translate complete, detected lang:", detectedLang);
      } catch (e) {
        console.warn("⚠ Translate failed (non-fatal):", e.message);
      }
    }

    // 5. Bedrock — extract critical medical info
    let extracted = {};
    if (englishText.length > 20) {
      try {
        const bedrockPrompt = `You are a medical AI assistant. Extract ONLY critical medical information from this document.

Return ONLY this JSON object, no text outside it:
{
  "allergies": ["each allergy with reaction type if known"],
  "medications": ["each medication with dosage and frequency"],
  "conditions": ["each medical condition with status if known"],
  "surgeries": ["each surgery with date and hospital if known"],
  "bloodGroup": "blood group string or empty",
  "summary": "one sentence clinical summary of this document"
}

Document text:
${englishText.slice(0, 8000)}`;

        const bedrockResp = await bedrock.send(new InvokeModelCommand({
          modelId: "anthropic.claude-3-haiku-20240307-v1:0",
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [{ role: "user", content: bedrockPrompt }],
          }),
        }));

        const bedrockText = JSON.parse(new TextDecoder().decode(bedrockResp.body)).content[0].text;
        const jsonMatch = bedrockText.match(/\{[\s\S]*\}/);
        extracted = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        console.log("✓ Bedrock extraction complete");
      } catch (e) {
        console.warn("⚠ Bedrock failed (non-fatal):", e.message);
      }
    }

    // 6. Save to DynamoDB — always runs
    const docId = randomUUID();
    const uploadedAt = new Date().toISOString();

    const langDisplay = { en: "English", hi: "Hindi → English", mr: "Marathi → English", ta: "Tamil → English", te: "Telugu → English" }[detectedLang] || `${detectedLang} → English`;

    await db.send(new UpdateItemCommand({
      TableName: "healthkey-patients",
      Key: { healthKeyId: { S: healthKeyId } },
      UpdateExpression: "SET documents = list_append(if_not_exists(documents, :empty), :doc)",
      ExpressionAttributeValues: {
        ":doc": {
          L: [{
            M: {
              docId:        { S: docId },
              fileName:     { S: fileName },
              s3Key:        { S: s3Key },
              detectedLang: { S: langDisplay },
              extracted:    { S: JSON.stringify(extracted) },
              uploadedAt:   { S: uploadedAt },
            }
          }]
        },
        ":empty": { L: [] },
      },
    }));

    console.log("✓ DynamoDB saved, docId:", docId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        docId, fileName, detectedLang: langDisplay,
        extracted, uploadedAt,
        message: "Document uploaded and processed successfully",
      }),
    };

  } catch (err) {
    console.error("✗ Fatal error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
