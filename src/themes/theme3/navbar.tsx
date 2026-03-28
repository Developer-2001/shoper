"use client";

import Link from "next/link";
import { Handbag, Search } from "lucide-react";

import { useAppSelector } from "@/hooks/useRedux";

type Theme3NavbarProps = {
  slug: string;
  logoText: string;
};

export function Theme3Navbar({ slug, logoText }: Theme3NavbarProps) {
  const cartCount = useAppSelector((state) =>
    state.cart.items
      .filter((item) => item.slug === slug)
      .reduce((count, item) => count + item.quantity, 0),
  );

  return (
    <header className="">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-6 py-3">
        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#331f17] lg:flex">
          <Link href={`/${slug}`} className="transition ">
            Home
          </Link>
          <Link href={`/${slug}/collections`} className="transition ">
            Collections
          </Link>
          <Link href={`/${slug}`} className="transition ">
            Blog
          </Link>
          <Link href={`/${slug}`} className="transition ">
            Contact
          </Link>
        </nav>

        <Link
          href={`/${slug}`}
          className="text-4xl font-semibold tracking-wide text-[#331f17]"
        >
          {logoText}
        </Link>

        <div className="flex items-center gap-3 text-[#331f17]">
          <button
            type="button"
            className="rounded-full p-2 transition "
            aria-label="Search"
          >
            <Search size={24} />
          </button>
          <Link
            href={`/${slug}/cart`}
            className="relative rounded-full p-2 transition "
            aria-label="Cart"
          >
            <Handbag size={24} />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#cc5639] px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
