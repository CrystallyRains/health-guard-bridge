import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-1";
const s3 = new S3Client({ region: REGION });
const db = new DynamoDBClient({ region: REGION });
const BUCKET = process.env.S3_BUCKET;

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const healthKeyId = event.pathParameters?.healthKeyId;
    const docId = event.pathParameters?.docId;

    if (!healthKeyId || !docId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "healthKeyId and docId required" }) };
    }

    // 1. Fetch patient and verify document belongs to them
    const result = await db.send(new GetItemCommand({
      TableName: "healthkey-patients",
      Key: { healthKeyId: { S: healthKeyId } },
    }));

    if (!result.Item) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Patient not found" }) };
    }

    // 2. Find the document in patient's document list
    const documents = result.Item.documents?.L || [];
    const doc = documents.find(d => d.M?.docId?.S === docId);

    if (!doc) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Document not found" }) };
    }

    const s3Key = doc.M?.s3Key?.S;
    if (!s3Key) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Document file not found" }) };
    }

    // 3. Generate pre-signed URL valid for 15 minutes
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      ResponseContentDisposition: `inline; filename="${doc.M?.fileName?.S || "document.pdf"}"`,
      ResponseContentType: "application/pdf",
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: signedUrl,
        fileName: doc.M?.fileName?.S,
        expiresIn: 900,
        message: "URL valid for 15 minutes",
      }),
    };

  } catch (err) {
    console.error("Get document URL error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
