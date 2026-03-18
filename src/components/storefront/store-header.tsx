"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

type Props = {
  slug: string;
  businessName: string;
  cartCount: number;
};

export function StoreHeader({ slug, businessName, cartCount }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={`/${slug}`} className="text-lg font-bold text-slate-900">
          {businessName}
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href={`/${slug}/products`}>Products</Link>
          <Link href={`/${slug}/cart`} className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
            <ShoppingBag className="size-3.5" />
            {cartCount}
          </Link>
        </nav>
      </div>
    </header>
  );
}
