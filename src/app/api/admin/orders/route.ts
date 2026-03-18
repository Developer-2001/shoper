import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";
import { OrderModel } from "@/models/Order";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const orders = await OrderModel.find({
      storeId: session.payload.storeId,
    })
      .sort({ createdAt: -1 })
      .populate("customerId", "name email mobile")
      .lean();

    return successResponse({ orders });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch orders", 500);
  }
}
