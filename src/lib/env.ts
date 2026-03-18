const envConfig = {
  MONGODB_URI: process.env.MONGODB_URI ?? "mongodb+srv://devpolaristechsol_db_user:zxfIYridzziGvCdf@shoper.xo7gtrh.mongodb.net/?appName=shoper",
  JWT_SECRET: process.env.JWT_SECRET ?? "Private143",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "INR",
};

export const env = envConfig;

export function assertServerEnv() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it in .env.local");
  }

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it in .env.local");
  }
}
