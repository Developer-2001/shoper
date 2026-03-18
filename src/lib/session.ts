import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAdminToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { AdminUser } from "@/models/admin-user";

export const ADMIN_COOKIE = "shoper_admin_token";

export async function getAdminFromCookie() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAdminToken(token);
    await connectToDatabase();

    return AdminUser.findById(payload.adminId).lean();
  } catch {
    return null;
  }
}

export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
