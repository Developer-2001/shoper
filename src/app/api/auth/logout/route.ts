import { AUTH_COOKIES, authCookieOptions } from "@/lib/auth";
import { successResponse } from "@/lib/response";

export async function POST() {
  const response = successResponse({ message: "Logged out" });

  response.cookies.set(AUTH_COOKIES.admin, "", { ...authCookieOptions, maxAge: 0 });

  return response;
}
