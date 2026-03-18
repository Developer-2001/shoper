import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { storeConfigSchema } from "@/lib/validations";
import { Store } from "@/models/store";

export async function GET() {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const store = await Store.findById(auth.payload.storeId).lean();
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ store });
}

export async function PUT(request: Request) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = storeConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const store = await Store.findByIdAndUpdate(
    auth.payload.storeId,
    {
      businessName: parsed.data.companyName,
      logoText: parsed.data.logoText,
      about: parsed.data.about,
      address: parsed.data.address,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      socialLinks: parsed.data.socialLinks,
      theme: parsed.data.theme,
      footerLinks: parsed.data.footerLinks,
    },
    { new: true }
  ).lean();

  return NextResponse.json({ store });
}
