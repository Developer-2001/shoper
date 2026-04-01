"use client";

import Link from "next/link";
import { Handbag, Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { useAppSelector } from "@/hooks/useRedux";

type Theme3NavbarProps = {
  slug: string;
  logoText: string;
};

export function Theme3Navbar({ slug, logoText }: Theme3NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useAppSelector((state) =>
    state.cart.items
      .filter((item) => item.slug === slug)
      .reduce((count, item) => count + item.quantity, 0),
  );

  return (
    <header className="relative z-40">
      <div className="mx-auto flex w-full items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-5 lg:px-6">
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#331f17] lg:flex">
          <Link href={`/${slug}`} className="transition hover:text-[#7b2f1e]">
            Home
          </Link>
          <Link href={`/${slug}/collections`} className="transition hover:text-[#7b2f1e]">
            Collections
          </Link>
          <Link href={`/${slug}`} className="transition hover:text-[#7b2f1e]">
            Blog
          </Link>
          <Link href={`/${slug}/contact`} className="transition hover:text-[#7b2f1e]">
            Contact
          </Link>
        </nav>

        <Link
          href={`/${slug}`}
          className="max-w-[58vw] truncate text-2xl font-semibold tracking-wide text-[#331f17] sm:max-w-[50vw] sm:text-3xl lg:max-w-none lg:text-4xl"
          onClick={() => setMobileMenuOpen(false)}
        >
          {logoText}
        </Link>

        <div className="flex items-center gap-3 text-[#331f17]">
          <button
            type="button"
            className="hidden rounded-full p-2 transition hover:bg-white/40 sm:inline-flex"
            aria-label="Search"
          >
            <Search size={22} />
          </button>
          <Link
            href={`/${slug}/cart`}
            className="relative rounded-full p-2 transition hover:bg-white/40"
            aria-label="Cart"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Handbag size={22} />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#cc5639] px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            className="inline-flex rounded-full p-2 transition hover:bg-white/40 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        className={`border-t border-[#e7cbc5] bg-[#fae9e6]/95 px-3 py-3 shadow-sm backdrop-blur lg:hidden ${
          mobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <nav className="flex flex-col gap-1 text-sm font-semibold text-[#331f17]">
          <Link
            href={`/${slug}`}
            className="rounded-lg px-3 py-2 transition hover:bg-white/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href={`/${slug}/collections`}
            className="rounded-lg px-3 py-2 transition hover:bg-white/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Collections
          </Link>
          <Link
            href={`/${slug}`}
            className="rounded-lg px-3 py-2 transition hover:bg-white/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href={`/${slug}/contact`}
            className="rounded-lg px-3 py-2 transition hover:bg-white/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
