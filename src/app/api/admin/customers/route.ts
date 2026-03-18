import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";
import { CustomerModel } from "@/models/Customer";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const customers = await CustomerModel.find({
      storeId: session.payload.storeId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ customers });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch customers", 500);
  }
}
