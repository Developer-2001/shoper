"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { removeFromCart } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

type Theme2BrandHeaderProps = {
  slug: string;
  logoText: string;
};

export function Theme2BrandHeader({ slug, logoText }: Theme2BrandHeaderProps) {
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCartOpen, setDesktopCartOpen] = useState(false);
  const desktopCartRef = useRef<HTMLDivElement | null>(null);

  const cartItems = useAppSelector((state) =>
    state.cart.items.filter((item) => item.slug === slug),
  );

  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems],
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

  useEffect(() => {
    if (!desktopCartOpen) return;

    function handleDocumentMouseDown(event: MouseEvent) {
      if (!desktopCartRef.current) return;
      if (!desktopCartRef.current.contains(event.target as Node)) {
        setDesktopCartOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDesktopCartOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [desktopCartOpen]);

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pb-4 pt-5">
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

          <div className="relative hidden lg:block" ref={desktopCartRef}>
            <button
              type="button"
              onClick={() => setDesktopCartOpen((previous) => !previous)}
              className="inline-flex cursor-pointer items-center gap-1 hover:opacity-80"
              aria-label="Toggle mini cart"
              aria-expanded={desktopCartOpen}
            >
              <ShoppingCart size={16} />
              <span>{cartLabel}</span>
            </button>

            {desktopCartOpen ? (
              <div className="absolute right-0 top-full z-[130] mt-3 w-[420px] border border-[#2e3f3c] bg-[#f5f6f3] shadow-[0_20px_40px_-22px_rgba(24,37,33,0.45)]">
                <span className="absolute -top-2 right-8 h-4 w-4 rotate-45 border-l border-t border-[#2e3f3c] bg-[#f5f6f3]" />

                <div className="max-h-[420px] overflow-y-auto px-4 py-4">
                  {cartItems.length ? (
                    <div className="divide-y divide-[#2e3f3c]">
                      {cartItems.map((item) => (
                        <div
                          key={item.productId}
                          className="grid grid-cols-[96px_minmax(0,1fr)_auto] gap-4 py-4 first:pt-2 last:pb-2"
                        >
                          <div className="relative h-20 w-20 overflow-hidden border border-[#d4dcda] bg-[#eef2ef]">
                            {isVideoUrl(item.image) ? (
                              <video
                                src={item.image}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="line-clamp-2 text-xl leading-none tracking-[0.02em] text-[#2f403d] [font-family:var(--font-theme2-serif)]">
                              {item.name}
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-4">
                              <span className="mt-2 text-sm text-[#4d605c]">Qty: {item.quantity}</span>
                              <span className="mt-2 text-base font-semibold text-[#2f403d]">
                                {formatMoney(item.price * item.quantity, item.currency)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                removeFromCart({
                                  slug,
                                  productId: item.productId,
                                }),
                              )
                            }
                            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#6a7d79] transition hover:bg-[#e6ece9] hover:text-[#2f403d]"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-[#556864]">Your cart is empty.</p>
                  )}
                </div>

                <div className="border-t border-[#2e3f3c] bg-[#f5f6f3] p-4">
                  <Link
                    href={`/${slug}/cart`}
                    onClick={() => setDesktopCartOpen(false)}
                    className="block bg-black px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#1d1d1d]"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            ) : null}
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
