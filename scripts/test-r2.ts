/** One-off R2 connectivity check: PutObject + list. Run: npm run test:r2 */
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint:
    process.env.R2_ENDPOINT ||
    `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucket = process.env.R2_BUCKET_NAME!;

async function main() {
  const key = `tasks/_connection-test.txt`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from("mote-team r2 ok"),
      ContentType: "text/plain",
    }),
  );
  console.log(`PutObject OK → ${bucket}/${key}`);

  const list = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }),
  );
  console.log(`ListObjects OK → ${list.KeyCount ?? 0} object(s)`);
  process.exit(0);
}

main().catch((e) => {
  console.error("R2 ERROR:", e.name, e.message);
  process.exit(1);
});
