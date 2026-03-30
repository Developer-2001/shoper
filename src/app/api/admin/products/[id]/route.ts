import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { productSchema } from "@/lib/validations";
import { Product } from "@/models/Product";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const routeParams = await params;

  const product = await Product.findOneAndUpdate(
    { _id: routeParams.id, storeId: auth.payload.storeId },
    {
      ...parsed.data,
      category: parsed.data.category.trim().replace(/\s+/g, " "),
    },
    { new: true }
  );

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const routeParams = await params;

  const deleted = await Product.findOneAndDelete({
    _id: routeParams.id,
    storeId: auth.payload.storeId,
  });

  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
