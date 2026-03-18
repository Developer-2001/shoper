import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { productSchema } from "@/lib/validators";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";
import { slugify, uniqueSlug } from "@/lib/utils";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: Params) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid product id", 400);
    }

    await connectDB();

    const product = await ProductModel.findOne({
      _id: id,
      storeId: session.payload.storeId,
    }).lean();

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse({ product });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch product", 500);
  }
}

export async function PUT(request: NextRequest, context: Params) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid product id", 400);
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid product data", 422, parsed.error.flatten());
    }

    await connectDB();

    const baseSlug = slugify(parsed.data.name) || uniqueSlug("product");
    let finalSlug = baseSlug;

    while (
      await ProductModel.exists({
        _id: { $ne: id },
        storeId: session.payload.storeId,
        slug: finalSlug,
      })
    ) {
      finalSlug = uniqueSlug(baseSlug);
    }

    const product = await ProductModel.findOneAndUpdate(
      {
        _id: id,
        storeId: session.payload.storeId,
      },
      {
        ...parsed.data,
        slug: finalSlug,
      },
      { new: true },
    );

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse({ product });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to update product", 500);
  }
}

export async function DELETE(_: NextRequest, context: Params) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid product id", 400);
    }

    await connectDB();

    const product = await ProductModel.findOneAndDelete({
      _id: id,
      storeId: session.payload.storeId,
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    return successResponse({ message: "Product deleted" });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to delete product", 500);
  }
}
