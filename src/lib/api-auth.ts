import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/session";
import { verifyAdminToken, type AdminJwtPayload, type PlatformAdminJwtPayload, type StoreAdminJwtPayload } from "@/lib/jwt";

type AuthError = {
  payload: undefined;
  error: NextResponse;
};

type AuthSuccess<T extends AdminJwtPayload> = {
  payload: T;
  error: undefined;
};

type AuthResult<T extends AdminJwtPayload = AdminJwtPayload> = AuthError | AuthSuccess<T>;

async function readAuthToken(): Promise<AuthResult> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!token) {
    return { payload: undefined, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const payload = await verifyAdminToken(token);
    return { payload, error: undefined };
  } catch {
    return { payload: undefined, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}

export async function requireAnyAdmin() {
  return readAuthToken();
}

export async function requireAdmin(): Promise<AuthResult<StoreAdminJwtPayload>> {
  const auth = await readAuthToken();
  if (auth.error) return auth;

  if (auth.payload.role !== "store_admin") {
    return {
      payload: undefined,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { payload: auth.payload, error: undefined };
}

export async function requirePlatformAdmin(): Promise<AuthResult<PlatformAdminJwtPayload>> {
  const auth = await readAuthToken();
  if (auth.error) return auth;

  if (auth.payload.role !== "platform_admin") {
    return {
      payload: undefined,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { payload: auth.payload, error: undefined };
}

export function isStoreAdmin(payload: AdminJwtPayload): payload is StoreAdminJwtPayload {
  return payload.role === "store_admin";
}

export function isPlatformAdmin(payload: AdminJwtPayload): payload is PlatformAdminJwtPayload {
  return payload.role === "platform_admin";
}
