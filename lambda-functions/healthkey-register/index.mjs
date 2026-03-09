import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const db = new DynamoDBClient({});

function generateHealthKeyId() {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const part1 = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
  const part2 = Array.from({ length: 4 }, () => alpha[Math.floor(Math.random() * alpha.length)]).join("");
  return `HK-${part1}-${part2}`;
}

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const {
      name, age, gender, phone, email, blood, state,
      allergies = [], medications = [], conditions = [],
      surgeries = [], emergencyContacts = [],
      privacyToggles = { allergies: true, medications: true, conditions: true, surgeries: true }
    } = body;

    if (!name || !phone || !blood) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "name, phone and blood are required" }) };
    }

    const healthKeyId = generateHealthKeyId();
    const userId = randomUUID();
    const createdAt = new Date().toISOString();

    await db.send(new PutItemCommand({
      TableName: "healthkey-patients",
      Item: {
        healthKeyId:       { S: healthKeyId },
        userId:            { S: userId },
        name:              { S: name },
        age:               { N: String(age || 0) },
        gender:            { S: gender || "" },
        phone:             { S: phone },
        email:             { S: email || "" },
        blood:             { S: blood },
        state:             { S: state || "" },
        allergies:         { S: JSON.stringify(allergies) },
        medications:       { S: JSON.stringify(medications) },
        conditions:        { S: JSON.stringify(conditions) },
        surgeries:         { S: JSON.stringify(surgeries) },
        emergencyContacts: { S: JSON.stringify(emergencyContacts) },
        privacyToggles:    { S: JSON.stringify(privacyToggles) },
        createdAt:         { S: createdAt },
      },
      ConditionExpression: "attribute_not_exists(healthKeyId)",
    }));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ healthKeyId, userId, createdAt }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
