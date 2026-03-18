import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function StorefrontNavbar({
  logoText,
  slug,
}: {
  logoText: string;
  slug: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-3">
        <Link href={`/${slug}`} className="min-w-28 text-xl font-black text-slate-900">
          {logoText}
        </Link>
        <div className="flex-1">
          <input
            className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
            placeholder="Search products"
          />
        </div>
        <Link
          href={`/${slug}/cart`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900"
          aria-label="Cart"
        >
          <ShoppingCart size={18} />
        </Link>
      </div>
    </header>
  );
}
