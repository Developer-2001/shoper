import { NextResponse, type NextRequest } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectToDatabase();

  const routeParams = await params;

  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store) {
    const errorResponse = NextResponse.json({ error: "Store not found" }, { status: 404 });
    errorResponse.headers.set("Cache-Control", "public, max-age=300");
    return errorResponse;
  }

  if (store.status === "inactive") {
    const errorResponse = NextResponse.json({ error: "Store is inactive" }, { status: 403 });
    errorResponse.headers.set("Cache-Control", "public, max-age=60");
    return errorResponse;
  }

  const [products, categories] = await Promise.all([
    Product.find({ storeId: store._id, isPublished: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Category.find({ storeId: store._id }).sort({ createdAt: 1 }).lean(),
  ]);

  const response = NextResponse.json({ store, products, categories });
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );

  return response;
}
