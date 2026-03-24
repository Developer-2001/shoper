"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingBag, Settings, User, LogOut, ShieldCheck } from "lucide-react";

type SessionRole = "store_admin" | "platform_admin";

const storeLinks = [
  { href: "/admin/home", label: "Home", icon: Home },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/configure-store", label: "Configure Store", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: User },
];

const platformLinks = [{ href: "/admin/platform", label: "Platform", icon: ShieldCheck }];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<SessionRole>("store_admin");

  useEffect(() => {
    async function loadRole() {
      const response = await fetch("/api/auth/me");
      if (!response.ok) return;

      const data = await response.json();
      if (data.role === "platform_admin") {
        setRole("platform_admin");
      }
    }

    loadRole();
  }, []);

  const links = useMemo(() => (role === "platform_admin" ? platformLinks : storeLinks), [role]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
      <div className="mb-8">
        <p className="text-2xl font-black tracking-tight text-slate-900">Shoper</p>
        <p className="text-sm text-slate-500">{role === "platform_admin" ? "Platform Admin" : "Store Admin"}</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}
