import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/session";
import { verifyAdminToken } from "@/lib/jwt";

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const payload = await verifyAdminToken(token);
    return { payload };
  } catch {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}
