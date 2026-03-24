import { NextResponse, type NextRequest } from "next/server";

import { verifyAdminToken } from "@/lib/jwt";

const publicAdminRoutes = new Set(["/admin/login", "/admin/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("shoper_admin_token")?.value;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isPlatformPage = pathname.startsWith("/admin/platform");
  const isPlatformApi = pathname.startsWith("/api/admin/platform");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (publicAdminRoutes.has(pathname)) {
    if (!token) return NextResponse.next();

    try {
      const payload = await verifyAdminToken(token);
      const redirectPath = payload.role === "platform_admin" ? "/admin/platform" : "/admin/home";
      return NextResponse.redirect(new URL(redirectPath, request.url));
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
    const payload = await verifyAdminToken(token);

    if (payload.role === "platform_admin") {
      if (isAdminApi && !isPlatformApi) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (isAdminPage && !isPlatformPage && !publicAdminRoutes.has(pathname)) {
        return NextResponse.redirect(new URL("/admin/platform", request.url));
      }

      return NextResponse.next();
    }

    if (isPlatformPage) {
      return NextResponse.redirect(new URL("/admin/home", request.url));
    }

    if (isPlatformApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
