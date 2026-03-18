import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { adminLoginSchema } from "@/lib/validators";
import { connectDB } from "@/lib/db";
import { AdminModel } from "@/models/Admin";
import { errorResponse, successResponse } from "@/lib/response";
import { AUTH_COOKIES, authCookieOptions, signAuthToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid login data", 422, parsed.error.flatten());
    }

    await connectDB();

    const email = parsed.data.email.toLowerCase();
    const admin = await AdminModel.findOne({ businessEmail: email });

    if (!admin) {
      return errorResponse("Invalid email or password", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(parsed.data.password, admin.passwordHash);

    if (!isPasswordCorrect) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = signAuthToken({
      userId: String(admin._id),
      role: "admin",
      storeId: String(admin.storeId),
      email: admin.businessEmail,
      mobile: admin.mobile,
    });

    const response = successResponse({
      admin: {
        _id: String(admin._id),
        ownerName: admin.ownerName,
        businessEmail: admin.businessEmail,
        mobile: admin.mobile,
        businessName: admin.businessName,
        currency: admin.currency,
        storeId: String(admin.storeId),
      },
    });

    response.cookies.set(AUTH_COOKIES.admin, token, authCookieOptions);
    return response;
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Login failed", 500);
  }
}
