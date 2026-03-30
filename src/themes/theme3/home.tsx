"use client";

import Image from "next/image";
import Link from "next/link";
import { MoveLeft, MoveRight, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3ProductCard } from "@/themes/theme3/product-card";
import { toCollectionSlug } from "@/themes/theme3/collection-utils";
import type { ThemeHomeProps } from "@/themes/types";

const MAX_COLLECTION_CARDS = 8;
const THEME3_ANNOUNCEMENT_TEXT = "Free Shipping On Orders Over $200";
const THEME3_ANNOUNCEMENT_DISMISS_KEY = "theme3_home_announcement_dismissed";
const THEME3_FEATURED_HEADING = "Sparkling New Pieces";
const THEME3_COLLECTION_LABELS = [
  "Rings",
  "Bracelets",
  "Necklaces",
  "Earrings",
  "Pendants",
  "Bangles",
  "Anklet",
  "Pearls",
];
const THEME3_COLLECTION_IMAGE_URLS = [
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/a-1774845949350.avif",
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/b-1774848444266.avif",
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/c-1774848489198.webp",
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/d-1774848498740.webp",
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/e-1774848516907.webp",
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/f-1774848530264.webp",
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/g-1774848542532.webp",
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/h-1774848555240.avif",
];

export function Theme3Home({ slug, store, products }: ThemeHomeProps) {
  useCartStorage();

  const sliderItems = [
    {
      imageUrl:
        "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/slider1-1774845449106.webp",
      title: "Elevate Your Style with the Perfect Accessory",
      description:
        "From everyday essentials to statement pieces, discover accessories that add the perfect finishing touch.",
    },
    {
      imageUrl:
        "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/slider2-1774845547454.webp",
      title: "Shine Brighter With Timeless Jewelry",
      description:
        "Discover beautifully crafted pieces designed to add elegance and confidence to every moment, elevating your look with timeless charm and grace.",
    },
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const [showAnnouncement, setShowAnnouncement] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(THEME3_ANNOUNCEMENT_DISMISS_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const dragStartXRef = useRef<number | null>(null);

  const collections = THEME3_COLLECTION_LABELS;
  const collectionTiles = useMemo(() => {
    const size = Math.min(
      MAX_COLLECTION_CARDS,
      Math.max(
        collections.length,
        THEME3_COLLECTION_LABELS.length,
        THEME3_COLLECTION_IMAGE_URLS.length,
      ),
    );

    return Array.from({ length: size }, (_, index) => ({
      label:
        collections[index] ||
        THEME3_COLLECTION_LABELS[index],
      imageUrl:
        THEME3_COLLECTION_IMAGE_URLS[index] 
    }));
  }, [collections]);
  const availableCollectionSlugs = useMemo(
    () =>
      new Set(
        products.map((product) =>
          toCollectionSlug(product.category || "uncategorized"),
        ),
      ),
    [products],
  );

  const featuredProducts = products.slice(0, 4);

  function goPrev() {
    if (!sliderItems.length) return;
    setActiveSlide(
      (prev) => (prev - 1 + sliderItems.length) % sliderItems.length,
    );
  }

  function goNext() {
    if (!sliderItems.length) return;
    setActiveSlide((prev) => (prev + 1) % sliderItems.length);
  }

  function startSwipe(clientX: number) {
    dragStartXRef.current = clientX;
  }

  function endSwipe(clientX: number) {
    if (dragStartXRef.current === null) return;

    const deltaX = clientX - dragStartXRef.current;
    dragStartXRef.current = null;

    if (Math.abs(deltaX) < 40) return;

    if (deltaX < 0) {
      goNext();
      return;
    }

    goPrev();
  }

  function cancelSwipe() {
    dragStartXRef.current = null;
  }

  function dismissAnnouncement() {
    setShowAnnouncement(false);
    try {
      window.localStorage.setItem(THEME3_ANNOUNCEMENT_DISMISS_KEY, "1");
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950">
      {showAnnouncement ? (
        <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center rounded-b-[28px] bg-[#cc5639] px-10 py-2 text-center text-sm font-semibold text-white">
          <span>{THEME3_ANNOUNCEMENT_TEXT}</span>
          <button
            type="button"
            onClick={dismissAnnouncement}
            className="absolute right-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <Theme3Navbar
        slug={slug}
        logoText={store.logoText || store.businessName}
      />

      <section className="mx-auto mt-6 w-full max-w-475 px-4">
        {/* Slider */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-black/10">
          <div
            className="relative aspect-1898/742 w-full overflow-hidden touch-pan-y"
            onPointerDown={(event) => startSwipe(event.clientX)}
            onPointerUp={(event) => endSwipe(event.clientX)}
            onPointerCancel={cancelSwipe}
            onPointerLeave={cancelSwipe}
          >
            {sliderItems.length ? (
              <div
                className="flex h-full w-full transition-transform duration-500 ease-in"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {sliderItems.map((item, index) => (
                  <div key={`${item.imageUrl}-${index}`} className="relative h-full w-full shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={`${store.businessName}-${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/20 to-transparent" />
                    <div className="absolute left-8 bottom-4 max-w-xl text-white md:left-12 md:bottom-14">
                      <div className="mb-4 flex gap-2">
                        <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-[#cc5639]">
                          Necklace
                        </span>
                        <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-[#cc5639]">
                          Ring
                        </span>
                      </div>
                      <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                        {item.title}
                      </h1>
                      <p className="mt-4 text-sm text-white/90 md:text-base">
                        {item.description}
                      </p>
                      <Link
                        href={`/${slug}/collections`}
                        className="mt-6 inline-block rounded-xl bg-[#cc5639] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b84c32]"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid h-full w-full place-items-center text-rose-300">
                Add slider media (1898x742)
              </div>
            )}

            {sliderItems.length > 1 ? (
              <div className="absolute bottom-7 left-8 z-10 flex items-center gap-2 md:left-12">
                {sliderItems.map((item, index) => (
                  <button
                    key={`${item.imageUrl}-indicator`}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className="cursor-pointer"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <span
                      className={`block h-1 rounded-full transition-all duration-300 ${
                        index === activeSlide ? "w-10 bg-white" : "w-6 bg-white/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : null}

            {sliderItems.length > 1 ? (
              <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex h-10 w-16 items-center justify-center rounded-md bg-[#cc5639]/70 text-[#3a0900] transition hover:bg-[#cc5639]"
                >
                  <MoveLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-10 w-16 items-center justify-center rounded-md bg-[#cc5639]/70 text-[#3a0900] transition hover:bg-[#cc5639]"
                >
                  <MoveRight size={18} />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {collectionTiles.map((collection, index) => {
            const collectionSlug = toCollectionSlug(collection.label);
            const href = availableCollectionSlugs.has(collectionSlug)
              ? `/${slug}/collections/${collectionSlug}`
              : `/${slug}/collections`;

            return (
              <Link
                key={`${collection.label}-${index}`}
                href={href}
                className="group relative aspect-258/90 overflow-hidden rounded-xl border border-rose-200 bg-white/70 text-left"
              >
                {collection.imageUrl ? (
                  <Image
                    src={collection.imageUrl}
                    alt={collection.label}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 50vw, 12vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-r from-rose-200 to-rose-100" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />
                <div className="collection_title_overlay absolute inset-x-0 bottom-0 px-2 py-2 text-center text-sm font-medium text-white">
                  {collection.label}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-4 py-8  w-full px-6 bg-[#fcf5f4]">
        <div className="text-center">
          <span className="rounded-full bg-[#cc5639] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Just Dropped
          </span>
          <h2 className="mt-4 text-4xl font-semibold text-rose-950">
            {THEME3_FEATURED_HEADING}
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <Theme3ProductCard
              key={product._id}
              slug={slug}
              product={product}
            />
          ))}
        </div>
      </section>

      <Theme3Footer
        slug={slug}
        companyName={store.businessName}
        about={store.about}
        address={store.address}
        contactEmail={store.contactEmail}
        contactPhone={store.contactPhone}
        footerLinks={store.footerLinks || []}
        socialLinks={store.socialLinks}
      />
    </div>
  );
}
