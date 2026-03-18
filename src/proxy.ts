import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "shoper_admin_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminAuthRoute = pathname === "/admin/login" || pathname === "/admin/signup";
  const isAdminDashboardRoute = pathname.startsWith("/admin") && !isAdminAuthRoute;
  const hasAdminToken = Boolean(request.cookies.get(ADMIN_COOKIE)?.value);

  if (isAdminDashboardRoute && !hasAdminToken) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminAuthRoute && hasAdminToken) {
    return NextResponse.redirect(new URL("/admin/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
