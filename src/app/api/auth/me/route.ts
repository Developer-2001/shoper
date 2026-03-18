import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { Store } from "@/models/store";
import { AdminUser } from "@/models/admin-user";

export async function GET() {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const admin = await AdminUser.findById(auth.payload.adminId).lean();
  const store = await Store.findById(auth.payload.storeId).lean();

  if (!admin || !store) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }

  return NextResponse.json({
    admin: {
      id: admin._id,
      ownerName: admin.ownerName,
      email: admin.email,
      mobile: admin.mobile,
    },
    store: {
      id: store._id,
      businessName: store.businessName,
      slug: store.slug,
      currency: store.currency,
    },
  });
}
