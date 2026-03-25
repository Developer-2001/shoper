"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingBag, Settings, User, LogOut, ShieldCheck, X as CloseIcon } from "lucide-react";

type SessionRole = "store_admin" | "platform_admin";

const storeLinks = [
  { href: "/admin/home", label: "Home", icon: Home },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/configure-store", label: "Configure Store", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: User },
];

const platformLinks = [{ href: "/admin/platform", label: "Platform", icon: ShieldCheck }];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white p-5 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black tracking-tight text-slate-900">Shoper</p>
            <p className="text-sm text-slate-500">{role === "platform_admin" ? "Platform Admin" : "Store Admin"}</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="space-y-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}


