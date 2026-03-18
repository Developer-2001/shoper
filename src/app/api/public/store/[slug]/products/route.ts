import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { StoreModel } from "@/models/Store";
import { ProductModel } from "@/models/Product";
import { errorResponse, successResponse } from "@/lib/response";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: NextRequest, context: Params) {
  try {
    const { slug } = await context.params;
    await connectDB();

    const store = await StoreModel.findOne({ slug: slug.toLowerCase() }).lean();

    if (!store) {
      return errorResponse("Store not found", 404);
    }

    const products = await ProductModel.find({
      storeId: store._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({
      store,
      products,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch products", 500);
  }
}
