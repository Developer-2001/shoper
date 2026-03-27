"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useAppSelector } from "@/hooks/useRedux";

type Theme1NavbarProps = {
  logoText: string;
  slug: string;
};

export function Theme1Navbar({ logoText, slug }: Theme1NavbarProps) {
  const cartCount = useAppSelector((state) =>
    state.cart.items
      .filter((item) => item.slug === slug)
      .reduce((count, item) => count + item.quantity, 0),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur">
      <div className="grid w-full grid-cols-3 items-center justify-evenly gap-4 px-8 py-3">
        <Link href={`/${slug}`} className="min-w-28 text-xl font-black text-slate-900">
          {logoText}
        </Link>

        <div className="flex items-center justify-center gap-5 text-sm font-semibold text-slate-700">
          <Link href={`/${slug}`} className="transition hover:text-slate-900">
            Home
          </Link>
          <Link href={`/${slug}/products`} className="transition hover:text-slate-900">
            Products
          </Link>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/${slug}/cart`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-xs text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
