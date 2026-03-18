import { cookies } from "next/headers";
import { verifyAuthToken, AUTH_COOKIES } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AdminModel } from "@/models/Admin";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIES.admin)?.value;

  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload || payload.role !== "admin") {
    return null;
  }

  await connectDB();
  const admin = await AdminModel.findById(payload.userId).lean();
  if (!admin) {
    return null;
  }

  return {
    payload,
    admin,
  };
}
