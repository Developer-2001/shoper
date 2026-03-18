import { NextRequest } from "next/server";
import { productSchema } from "@/lib/validators";
import { connectDB } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";
import { slugify, uniqueSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const products = await ProductModel.find({
      storeId: session.payload.storeId,
      ...(search
        ? {
            name: {
              $regex: search,
              $options: "i",
            },
          }
        : {}),
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ products });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid product data", 422, parsed.error.flatten());
    }

    await connectDB();

    const payload = parsed.data;
    const baseSlug = slugify(payload.name) || uniqueSlug("product");
    let finalSlug = baseSlug;

    while (
      await ProductModel.exists({
        storeId: session.payload.storeId,
        slug: finalSlug,
      })
    ) {
      finalSlug = uniqueSlug(baseSlug);
    }

    const product = await ProductModel.create({
      ...payload,
      slug: finalSlug,
      storeId: session.payload.storeId,
    });

    return successResponse({ product }, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to create product", 500);
  }
}
