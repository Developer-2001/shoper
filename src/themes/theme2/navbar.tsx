"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useAppSelector } from "@/hooks/useRedux";
import { THEME2_ACCENT_COLOR } from "@/themes/theme-defaults";

type Theme2NavbarProps = {
  slug: string;
  logoText: string;
};

export function Theme2Navbar({ slug, logoText }: Theme2NavbarProps) {
  const cartCount = useAppSelector((state) =>
    state.cart.items
      .filter((item) => item.slug === slug)
      .reduce((count, item) => count + item.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href={`/${slug}`} className="text-2xl font-black uppercase tracking-wide text-amber-900">
          {logoText}
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-amber-800 md:flex">
          <Link href={`/${slug}`} className="transition hover:text-amber-950">
            Home
          </Link>
          <Link href={`/${slug}/products`} className="transition hover:text-amber-950">
            Products
          </Link>
        </nav>

        <Link
          href={`/${slug}/cart`}
          aria-label="Cart"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow"
          style={{ backgroundColor: THEME2_ACCENT_COLOR }}
        >
          <ShoppingBag size={18} />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-950 px-1 text-[10px] font-bold text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
