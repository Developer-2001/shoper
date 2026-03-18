import mongoose from "mongoose";
import { env, assertServerEnv } from "@/lib/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = globalCache;

export async function connectDB() {
  assertServerEnv();

  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME ?? "shoper",
      autoIndex: true,
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
