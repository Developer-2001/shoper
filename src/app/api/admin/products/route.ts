import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { productSchema } from "@/lib/validations";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";

export async function GET() {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const products = await Product.find({ storeId: auth.payload.storeId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const store = await Store.findById(auth.payload.storeId).select("currency").lean();
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await Product.create({
    ...parsed.data,
    currency: store.currency,
    category: parsed.data.category.trim().replace(/\s+/g, " "),
    storeId: auth.payload.storeId,
  });

  return NextResponse.json({ product }, { status: 201 });
}
