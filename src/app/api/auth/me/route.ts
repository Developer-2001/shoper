import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAnyAdmin } from "@/lib/api-auth";
import { PLATFORM_ADMIN_IDENTIFIER, PLATFORM_ADMIN_NAME } from "@/lib/platform-admin";
import { Store } from "@/models/Store";
import { AdminUser } from "@/models/admin-user";

export async function GET() {
  await connectToDatabase();

  const auth = await requireAnyAdmin();
  if (auth.error) return auth.error;

  if (auth.payload.role === "platform_admin") {
    return NextResponse.json({
      role: "platform_admin",
      admin: {
        id: "platform-admin",
        ownerName: PLATFORM_ADMIN_NAME,
        email: PLATFORM_ADMIN_IDENTIFIER,
        mobile: "",
      },
      store: null,
    });
  }

  const admin = await AdminUser.findById(auth.payload.adminId).lean();
  const store = await Store.findById(auth.payload.storeId).lean();

  if (!admin || !store) {
    return NextResponse.json({ error: "Session invalid" }, { status: 401 });
  }

  return NextResponse.json({
    role: "store_admin",
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
      status: store.status,
    },
  });
}
