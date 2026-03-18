import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { StoreModel } from "@/models/Store";
import { ProductModel } from "@/models/Product";
import { errorResponse, successResponse } from "@/lib/response";

type Params = {
  params: Promise<{ slug: string; productSlug: string }>;
};

export async function GET(_: NextRequest, context: Params) {
  try {
    const { slug, productSlug } = await context.params;
    await connectDB();

    const store = await StoreModel.findOne({ slug: slug.toLowerCase() }).lean();

    if (!store) {
      return errorResponse("Store not found", 404);
    }

    const product = await ProductModel.findOne({
      storeId: store._id,
      slug: productSlug.toLowerCase(),
      isActive: true,
    }).lean();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse({ store, product });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch product", 500);
  }
}
