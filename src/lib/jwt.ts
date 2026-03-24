import { SignJWT, jwtVerify } from "jose";

const secretValue = process.env.JWT_SECRET || "change-me-now";
const secret = new TextEncoder().encode(secretValue);

export type SessionRole = "store_admin" | "platform_admin";

export type StoreAdminJwtPayload = {
  role: "store_admin";
  adminId: string;
  storeId: string;
  slug: string;
};

export type PlatformAdminJwtPayload = {
  role: "platform_admin";
  adminId: "platform-admin";
};

export type AdminJwtPayload = StoreAdminJwtPayload | PlatformAdminJwtPayload;

export async function signAdminToken(payload: AdminJwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AdminJwtPayload;
}
