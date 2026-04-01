import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { updateAdminProfileSchema } from "@/lib/validations";
import { Store } from "@/models/Store";
import { AdminUser } from "@/models/admin-user";

export async function PUT(request: Request) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = updateAdminProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ownerName, businessName } = parsed.data;

  try {
    const [admin, store] = await Promise.all([
      AdminUser.findByIdAndUpdate(auth.payload.adminId, { ownerName }, { new: true }).lean(),
      Store.findByIdAndUpdate(auth.payload.storeId, { ownerName, businessName }, { new: true }).lean(),
    ]);

    if (!admin || !store) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const response = NextResponse.json({
      ok: true,
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
      },
    });

    return response;
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
