import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

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

    if (!healthKeyId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "healthKeyId required" }) };
    }

    const result = await db.send(new QueryCommand({
      TableName: "healthkey-audit-log",
      IndexName: "healthKeyId-accessedAt-index",
      KeyConditionExpression: "healthKeyId = :hk",
      ExpressionAttributeValues: { ":hk": { S: healthKeyId } },
      ScanIndexForward: false, // newest first
      Limit: 50,
    }));

    const logs = (result.Items || []).map(item => ({
      sessionId:    item.sessionId?.S,
      doctorName:   item.doctorName?.S,
      hospitalName: item.hospitalName?.S,
      purpose:      item.purpose?.S,
      accessedAt:   item.accessedAt?.S,
      expiresAt:    item.expiresAt?.S,
      status:       new Date(item.expiresAt?.S) > new Date() ? "ACTIVE" : "EXPIRED",
      summaryShown: JSON.parse(item.summaryShown?.S || "{}"),
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ healthKeyId, logs, total: logs.length }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
