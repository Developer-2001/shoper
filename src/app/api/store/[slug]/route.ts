import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectToDatabase();

  const routeParams = await params;

  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  if (store.status === "inactive") {
    return NextResponse.json({ error: "Store is inactive" }, { status: 403 });
  }

  const [products, categories] = await Promise.all([
    Product.find({ storeId: store._id, isPublished: true })
      .sort({ createdAt: -1 })
      .lean(),
    Category.find({ storeId: store._id }).sort({ createdAt: 1 }).lean(),
  ]);

  return NextResponse.json({ store, products, categories });
}
