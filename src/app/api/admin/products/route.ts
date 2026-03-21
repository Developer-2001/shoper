import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { productSchema } from "@/lib/validations";
import { Product } from "@/models/Product";

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

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await Product.create({
    ...parsed.data,
    storeId: auth.payload.storeId,
  });

  return NextResponse.json({ product }, { status: 201 });
}
