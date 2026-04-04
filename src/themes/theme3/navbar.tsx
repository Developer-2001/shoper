"use client";

import Link from "next/link";
import { Handbag, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

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
    <header className="relative z-110">
      <div className="mx-auto flex w-full items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-5 lg:px-6">
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#331f17] lg:flex">
          <Link href={`/${slug}`} className="transition hover:text-[#7b2f1e]">
            Home
          </Link>
          <Link
            href={`/${slug}/product`}
            className="transition hover:text-[#7b2f1e]"
          >
            Products
          </Link>
          <Link href={`/${slug}`} className="transition hover:text-[#7b2f1e]">
            Blog
          </Link>
          <Link
            href={`/${slug}/contact`}
            className="transition hover:text-[#7b2f1e]"
          >
            Contact
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((previous) => !previous)}
          className="inline-flex rounded-full p-2 transition hover:bg-white/40 lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
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
        </div>
      </div>
      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-100 transition-opacity duration-200 lg:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[min(84vw,320px)] border-r border-[#e7cbc5] bg-[#fae9e6] p-4 shadow-2xl transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between border-b border-[#e7cbc5] pb-3">
            <p className="truncate text-lg font-semibold text-[#331f17]">
              {logoText}
            </p>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex rounded-full p-2 transition hover:bg-white/50"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 text-sm font-semibold text-[#331f17]">
            <Link
              href={`/${slug}`}
              className="rounded-lg px-3 py-2 transition hover:bg-white/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href={`/${slug}/product`}
              className="rounded-lg px-3 py-2 transition hover:bg-white/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
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
        </aside>
      </div>
    </header>
  );
}

