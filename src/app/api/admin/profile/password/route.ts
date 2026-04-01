import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { changeAdminPasswordSchema } from "@/lib/validations";
import { AdminUser } from "@/models/admin-user";

export async function PUT(request: Request) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = changeAdminPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from current password." },
      { status: 400 }
    );
  }

  const admin = await AdminUser.findById(auth.payload.adminId);
  if (!admin) {
    return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!isCurrentPasswordValid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await admin.save();

  return NextResponse.json({ ok: true });
}
