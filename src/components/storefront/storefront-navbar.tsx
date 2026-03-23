import Link from "next/link";
import { ShoppingCart } from "lucide-react";


export function StorefrontNavbar({
  logoText,
  slug,
}: {
  logoText: string;
  slug: string;
}) {
  const cartCount = 3; // This should be dynamically fetched from your cart state
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/95 backdrop-blur">
      <div className=" grid grid-cols-3 w-full  items-center justify-evenly gap-4 px-8 py-3">
        <Link
          href={`/${slug}`}
          className="min-w-28 text-xl font-black text-slate-900"
        >
          {logoText}
        </Link>

        <input
          className="min-w-20 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-900"
          placeholder="Search products"
        />

        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/${slug}/cart`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900"
            aria-label="Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-xs  text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
