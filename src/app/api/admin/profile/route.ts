import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";
import { AdminModel } from "@/models/Admin";
import { adminProfileSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const admin = await AdminModel.findById(session.payload.userId).lean();
    if (!admin) {
      return errorResponse("Admin not found", 404);
    }

    return successResponse({
      profile: {
        _id: String(admin._id),
        ownerName: admin.ownerName,
        businessEmail: admin.businessEmail,
        mobile: admin.mobile,
        businessName: admin.businessName,
        currency: admin.currency,
        storeId: String(admin.storeId),
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch profile", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = adminProfileSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid profile data", 422, parsed.error.flatten());
    }

    await connectDB();

    const admin = await AdminModel.findByIdAndUpdate(
      session.payload.userId,
      {
        ownerName: parsed.data.ownerName,
        businessEmail: parsed.data.businessEmail,
        mobile: parsed.data.mobile,
      },
      { new: true },
    ).lean();

    if (!admin) {
      return errorResponse("Admin not found", 404);
    }

    return successResponse({
      profile: {
        _id: String(admin._id),
        ownerName: admin.ownerName,
        businessEmail: admin.businessEmail,
        mobile: admin.mobile,
        businessName: admin.businessName,
        currency: admin.currency,
        storeId: String(admin.storeId),
      },
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to update profile", 500);
  }
}
