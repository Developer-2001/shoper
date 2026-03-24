import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requirePlatformAdmin } from "@/lib/api-auth";
import { updateStoreStatusSchema } from "@/lib/validations";
import { Store } from "@/models/Store";
import { AdminUser } from "@/models/admin-user";

export async function GET() {
  await connectToDatabase();

  const auth = await requirePlatformAdmin();
  if (auth.error) return auth.error;

  const stores = await Store.find({}).sort({ createdAt: -1 }).lean();
  const storeIds = stores.map((store) => store._id);

  const admins = storeIds.length
    ? await AdminUser.find({ storeId: { $in: storeIds } }).sort({ createdAt: -1 }).lean()
    : [];

  const adminMap = new Map<string, typeof admins>();

  for (const admin of admins) {
    const key = admin.storeId.toString();
    const list = adminMap.get(key) || [];
    list.push(admin);
    adminMap.set(key, list);
  }

  return NextResponse.json({
    stores: stores.map((store) => ({
      id: store._id,
      businessName: store.businessName,
      businessEmail: store.businessEmail,
      ownerName: store.ownerName,
      mobile: store.mobile,
      slug: store.slug,
      currency: store.currency,
      status: store.status || "inactive",
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      admins: (adminMap.get(store._id.toString()) || []).map((admin) => ({
        id: admin._id,
        ownerName: admin.ownerName,
        email: admin.email,
        mobile: admin.mobile,
      })),
    })),
  });
}

export async function PATCH(request: Request) {
  await connectToDatabase();

  const auth = await requirePlatformAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = updateStoreStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const store = await Store.findByIdAndUpdate(
    parsed.data.storeId,
    { status: parsed.data.status },
    { new: true }
  ).lean();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({
    store: {
      id: store._id,
      status: store.status,
      slug: store.slug,
      businessName: store.businessName,
    },
  });
}
