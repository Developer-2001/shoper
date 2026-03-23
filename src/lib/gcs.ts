import { Storage } from "@google-cloud/storage";

const projectId = process.env.GCP_PROJECT_ID;
const clientEmail = process.env.GCP_CLIENT_EMAIL;
const privateKey = process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n");
const bucketName = process.env.GCP_BUCKET_NAME;

if (!projectId || !clientEmail || !privateKey || !bucketName) {
  throw new Error("Missing GCP Storage configuration in environment variables.");
}

const storage = new Storage({
  projectId,
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
});

export const bucket = storage.bucket(bucketName);
export default storage;
