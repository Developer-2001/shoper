import { NextResponse, type NextRequest } from "next/server";

import { verifyAdminToken } from "@/lib/jwt";

const publicAdminRoutes = new Set(["/admin/login", "/admin/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("shoper_admin_token")?.value;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (publicAdminRoutes.has(pathname)) {
    if (!token) return NextResponse.next();

    try {
      await verifyAdminToken(token);
      return NextResponse.redirect(new URL("/admin/home", request.url));
    } catch {
      return NextResponse.next();
    }
  }

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await verifyAdminToken(token);
    return NextResponse.next();
  } catch {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
