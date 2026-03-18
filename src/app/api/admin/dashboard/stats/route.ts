import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";
import { ProductModel } from "@/models/Product";
import { CustomerModel } from "@/models/Customer";
import { OrderModel } from "@/models/Order";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const [products, customers, orders, pendingOrders, revenueResult] = await Promise.all([
      ProductModel.countDocuments({ storeId: session.payload.storeId }),
      CustomerModel.countDocuments({ storeId: session.payload.storeId }),
      OrderModel.countDocuments({ storeId: session.payload.storeId }),
      OrderModel.countDocuments({
        storeId: session.payload.storeId,
        status: { $in: ["pending", "confirmed", "processing"] },
      }),
      OrderModel.aggregate([
        {
          $match: {
            storeId: new Types.ObjectId(session.payload.storeId),
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    return successResponse({
      stats: {
        products,
        customers,
        orders,
        pendingOrders,
        revenue: revenueResult[0]?.totalRevenue ?? 0,
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch dashboard stats", 500);
  }
}
