import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  await connectToDatabase();

  const routeParams = await params;
  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const product = await Product.findOne({ _id: routeParams.id, storeId: store._id }).lean();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
