import { DynamoDBClient, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({});

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const healthKeyId = event.pathParameters?.healthKeyId
      || event.queryStringParameters?.healthKeyId;

    const phone = event.queryStringParameters?.phone;

    // Lookup by HealthKey ID
    if (healthKeyId) {
      const result = await db.send(new GetItemCommand({
        TableName: "healthkey-patients",
        Key: { healthKeyId: { S: healthKeyId } },
      }));

      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Patient not found. Please check your HealthKey ID." }),
        };
      }

      const p = result.Item;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          healthKeyId:       p.healthKeyId?.S,
          name:              p.name?.S,
          age:               p.age?.N,
          gender:            p.gender?.S,
          phone:             p.phone?.S,
          email:             p.email?.S,
          blood:             p.blood?.S,
          state:             p.state?.S,
          allergies:         JSON.parse(p.allergies?.S || "[]"),
          medications:       JSON.parse(p.medications?.S || "[]"),
          conditions:        JSON.parse(p.conditions?.S || "[]"),
          surgeries:         JSON.parse(p.surgeries?.S || "[]"),
          emergencyContacts: JSON.parse(p.emergencyContacts?.S || "[]"),
          privacyToggles:    JSON.parse(p.privacyToggles?.S || "{}"),
          documents:         (p.documents?.L || []).map(d => ({
            docId:        d.M?.docId?.S,
            fileName:     d.M?.fileName?.S,
            detectedLang: d.M?.detectedLang?.S,
            uploadedAt:   d.M?.uploadedAt?.S,
            extracted:    JSON.parse(d.M?.extracted?.S || "{}"),
          })),
          createdAt: p.createdAt?.S,
        }),
      };
    }

    // Lookup by phone number (using GSI)
    if (phone) {
      const result = await db.send(new QueryCommand({
        TableName: "healthkey-patients",
        IndexName: "phone-index",
        KeyConditionExpression: "phone = :ph",
        ExpressionAttributeValues: { ":ph": { S: phone } },
        Limit: 1,
      }));

      if (!result.Items || result.Items.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "No account found with this phone number." }),
        };
      }

      const p = result.Items[0];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          healthKeyId:       p.healthKeyId?.S,
          name:              p.name?.S,
          phone:             p.phone?.S,
          blood:             p.blood?.S,
          allergies:         JSON.parse(p.allergies?.S || "[]"),
          medications:       JSON.parse(p.medications?.S || "[]"),
          conditions:        JSON.parse(p.conditions?.S || "[]"),
          surgeries:         JSON.parse(p.surgeries?.S || "[]"),
          emergencyContacts: JSON.parse(p.emergencyContacts?.S || "[]"),
          privacyToggles:    JSON.parse(p.privacyToggles?.S || "{}"),
          documents:         (p.documents?.L || []).map(d => ({
            docId:        d.M?.docId?.S,
            fileName:     d.M?.fileName?.S,
            detectedLang: d.M?.detectedLang?.S,
            uploadedAt:   d.M?.uploadedAt?.S,
          })),
        }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Provide either healthKeyId or phone" }),
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
