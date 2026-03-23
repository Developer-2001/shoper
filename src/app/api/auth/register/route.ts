import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { signAdminToken } from "@/lib/jwt";
import { setAdminCookie } from "@/lib/session";
import { registerSchema } from "@/lib/validations";
import { Store } from "@/models/Store";
import { AdminUser } from "@/models/admin-user";

export async function POST(request: Request) {
  await connectToDatabase();

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { businessName, businessEmail, mobile, ownerName, currency, slug, themeLayout, password } = parsed.data;

  const existingStore = await Store.findOne({
    $or: [{ slug }, { businessEmail }, { mobile }],
  });

  if (existingStore) {
    return NextResponse.json({ error: "Store already exists" }, { status: 409 });
  }

  const store = await Store.create({
    businessName,
    businessEmail,
    mobile,
    ownerName,
    currency,
    slug,
    contactEmail: businessEmail,
    contactPhone: mobile,
    logoText: businessName,
    about: `Welcome to ${businessName}`,
    address: "",
    footerLinks: [
      { label: "Home", href: `/${slug}` },
      { label: "Products", href: `/${slug}/products` },
      { label: "Cart", href: `/${slug}/cart` },
    ],
    theme: {
      layout: themeLayout,
      primary: "#0f172a",
      accent: "#14b8a6",
      heroImage:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
      sliderImages: [
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?q=80&w=1200&auto=format&fit=crop",
      ],
    },
  });

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await AdminUser.create({
    storeId: store._id,
    email: businessEmail,
    mobile,
    ownerName,
    passwordHash,
  });

  const token = await signAdminToken({
    adminId: admin._id.toString(),
    storeId: store._id.toString(),
    slug,
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
