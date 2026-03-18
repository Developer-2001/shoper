import jwt from "jsonwebtoken";
import { env, assertServerEnv } from "@/lib/env";

export type AuthRole = "admin";

export type AuthTokenPayload = {
  userId: string;
  role: AuthRole;
  storeId: string;
  email?: string;
  mobile?: string;
};

export const AUTH_COOKIES = {
  admin: "shoper_admin_token",
};

const TOKEN_EXPIRY = "7d";

export function signAuthToken(payload: AuthTokenPayload) {
  assertServerEnv();
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    assertServerEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded as AuthTokenPayload;
  } catch {
    return null;
  }
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};
