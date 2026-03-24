import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE } from "@/lib/session";
import { verifyAdminToken } from "@/lib/jwt";

export default async function AdminPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    const payload = await verifyAdminToken(token);

    if (payload.role === "platform_admin") {
      redirect("/admin/platform");
    }

    redirect("/admin/home");
  } catch {
    redirect("/admin/login");
  }
}
