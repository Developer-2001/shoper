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
    status: "inactive",
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
      heroImage: "",
      sliderImages: [],
      theme3: {
        announcementText: "Free Shipping On Orders Over $200",
        collectionLabels: ["Rings", "Bracelets", "Necklaces", "Earrings", "Pendants", "Bangles"],
        collectionLabelImages: [],
        featuredHeading: "Sparkling New Pieces",
      },
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
    role: "store_admin",
    adminId: admin._id.toString(),
    storeId: store._id.toString(),
    slug,
  });

  const response = NextResponse.json({
    ok: true,
    role: "store_admin",
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
      status: store.status,
    },
  });

  setAdminCookie(response, token);
  return response;
}
