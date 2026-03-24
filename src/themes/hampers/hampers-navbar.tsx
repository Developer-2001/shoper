"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useAppSelector } from "@/hooks/useRedux";

export function HampersNavbar({
  logoText,
  slug,
}: {
  logoText: string;
  slug: string;
}) {
  const cartCount = useAppSelector((state) =>
    state.cart.items
      .filter((item) => item.slug === slug)
      .reduce((count, item) => count + item.quantity, 0),
  );

  return (
    <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-3 items-center gap-4 px-6 py-3">
        <Link href={`/${slug}`} className="text-xl font-black text-amber-800">
          {logoText}
        </Link>

        <div className="flex items-center justify-center gap-6 text-sm font-medium text-stone-700">
          <Link href={`/${slug}`} className="transition hover:text-amber-700">
            Home
          </Link>
          <Link href={`/${slug}/products`} className="transition hover:text-amber-700">
            Products
          </Link>
          <Link href={`/${slug}/products`} className="transition hover:text-amber-700">
            Collections
          </Link>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={`/${slug}/cart`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 text-amber-800 transition hover:bg-amber-50"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-xs text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
