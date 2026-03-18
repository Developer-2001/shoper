"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Package,
  ShoppingCart,
  Settings,
  User,
  Users,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Home", href: "/admin/home", icon: House },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Configure Store", href: "/admin/configure-store", icon: Settings },
  { label: "Profile", href: "/admin/profile", icon: User },
  { label: "Customers", href: "/admin/customers", icon: Users },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r border-slate-200 bg-white md:w-72">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <Store className="size-5 text-slate-900" />
        <h2 className="font-bold text-slate-900">Shoper Admin</h2>
      </div>

      <nav className="space-y-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
