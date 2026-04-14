"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppSelector } from "@/hooks/useRedux";

type Theme2BrandHeaderProps = {
  slug: string;
  logoText: string;
};

export function Theme2BrandHeader({ slug, logoText }: Theme2BrandHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useAppSelector((state) =>
    state.cart.items
      .filter((item) => item.slug === slug)
      .reduce((count, item) => count + item.quantity, 0),
  );

  const cartLabel = useMemo(() => {
    if (cartCount <= 0) return "0 items";
    if (cartCount === 1) return "1 item";
    return `${cartCount} items`;
  }, [cartCount]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-4">
        <div className="flex items-center justify-between text-md text-[#2f4f4a]">
          <button
            type="button"
            className="inline-flex items-center gap-2 tracking-[0.02em] hover:opacity-70"
            aria-label="Search"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            className="rounded-full p-1.5 text-[#2f4f4a] transition hover:bg-[#ebeeec] lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="hidden items-center gap-4 text-md lg:flex">
            <Link href={`/${slug}/cart`} className="inline-flex items-center gap-1 hover:opacity-70">
              <ShoppingCart size={14} />
              <span>{cartLabel}</span>
            </Link>
          </div>
        </div>

        <div className="mt-5 text-center text-[#21252b]">
          <p className="text-[11px] uppercase tracking-[0.35em]">EST 2015</p>
          <Link
            href={`/${slug}`}
            className="mt-2 inline-block text-5xl leading-none [font-family:var(--font-theme2-serif)] sm:text-6xl"
          >
            {logoText || "PRESENT DAY"}
          </Link>
          <p className="mt-2 text-sm uppercase tracking-[0.38em] text-[#37474f]">Gift Boxes & Baskets</p>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-120 transition-opacity duration-200 lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/30"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu overlay"
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[min(84vw,320px)] border-l border-[#d5dbd8] bg-[#f5f6f3] p-5 transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#d5dbd8] pb-3">
            <p className="text-sm uppercase tracking-[0.22em] text-[#2f4f4a]">Menu</p>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full p-1.5 transition hover:bg-[#ebeeec]"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-3 text-sm uppercase tracking-[0.12em] text-[#2e3f3c]">
            <Link href={`/${slug}`} onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Home
            </Link>
            <Link href={`/${slug}/product`} onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Shop All
            </Link>
            <Link href={`/${slug}/product?categories=all-occasions`} onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Occasions
            </Link>
            <Link href={`/${slug}/product?categories=corporate-gifts`} onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Corporate Gifts
            </Link>
            <Link href={`/${slug}/contact`} onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Info
            </Link>
            <Link href={`/${slug}/cart`} onClick={() => setMobileMenuOpen(false)} className="block py-2">
              Cart ({cartCount})
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
