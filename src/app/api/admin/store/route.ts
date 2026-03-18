import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";
import { StoreModel } from "@/models/Store";
import { storeConfigSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const store = await StoreModel.findById(session.payload.storeId).lean();

    if (!store) {
      return errorResponse("Store not found", 404);
    }

    return successResponse({ store });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch store", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = storeConfigSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid store config data", 422, parsed.error.flatten());
    }

    await connectDB();

    const store = await StoreModel.findByIdAndUpdate(
      session.payload.storeId,
      {
        ...parsed.data,
      },
      { new: true },
    ).lean();

    if (!store) {
      return errorResponse("Store not found", 404);
    }

    return successResponse({ store });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to update store", 500);
  }
}
