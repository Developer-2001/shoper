import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { signAdminToken } from "@/lib/jwt";
import { setAdminCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validations";
import { Store } from "@/models/store";
import { AdminUser } from "@/models/admin-user";

export async function POST(request: Request) {
  await connectToDatabase();

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { identifier, password } = parsed.data;

  const admin = await AdminUser.findOne({
    $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }],
  });

  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const store = await Store.findById(admin.storeId);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const token = await signAdminToken({
    adminId: admin._id.toString(),
    storeId: store._id.toString(),
    slug: store.slug,
  });

  const response = NextResponse.json({
    ok: true,
    admin: {
      id: admin._id,
      ownerName: admin.ownerName,
      email: admin.email,
    },
    store: {
      id: store._id,
      businessName: store.businessName,
      slug: store.slug,
      currency: store.currency,
    },
  });

  setAdminCookie(response, token);
  return response;
}
