import { getAdminSession } from "@/lib/server-auth";
import { errorResponse, successResponse } from "@/lib/response";

export async function GET() {
  const adminSession = await getAdminSession();

  if (adminSession) {
    return successResponse({
      session: {
        role: "admin",
        userId: String(adminSession.admin._id),
        storeId: String(adminSession.admin.storeId),
        name: adminSession.admin.ownerName,
        email: adminSession.admin.businessEmail,
        mobile: adminSession.admin.mobile,
      },
    });
  }

  return errorResponse("Unauthorized", 401);
}
