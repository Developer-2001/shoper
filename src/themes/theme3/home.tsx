"use client";

import Image from "next/image";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import {
  toAnalyticsItem,
  trackStorefrontEvent,
} from "@/lib/storefront-analytics/client";
import { Theme3Announcement } from "@/themes/theme3/announcement";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3ProductCard } from "@/themes/theme3/product-card";
import { Theme3CartToastProvider } from "@/themes/theme3/cart-toast";
import { toCollectionSlug } from "@/themes/theme3/collection-utils";
import type { ThemeHomeProps } from "@/themes/types";

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

export function Theme3Home({
  slug,
  store,
  products,
  categories = [],
}: ThemeHomeProps) {
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
  const dragStartXRef = useRef<number | null>(null);

  const collectionLabels = useMemo(
    () =>
      categories
        .map((category) => category.name?.trim())
        .filter((label): label is string => !!label)
        .slice(0, 8),
    [categories],
  );

  const collectionTiles = useMemo(() => {
    return collectionLabels.map((label, index) => ({
      label,
      imageUrl:
        THEME3_COLLECTION_IMAGE_URLS[index] || THEME3_COLLECTION_IMAGE_URLS[0],
    }));
  }, [collectionLabels]);

  const featuredProducts = products.slice(0, 4);
  const featuredAnalyticsItems = useMemo(
    () =>
      featuredProducts.map((product) =>
        toAnalyticsItem({
          productId: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: 1,
        }),
      ),
    [featuredProducts],
  );

  useEffect(() => {
    if (!featuredAnalyticsItems.length) return;

    trackStorefrontEvent({
      event: "view_item_list",
      slug,
      storeTheme: "theme3",
      item_list_name: "home_featured",
      ecommerce: {
        currency: featuredProducts[0]?.currency || "INR",
        items: featuredAnalyticsItems,
      },
    });
  }, [slug, featuredProducts, featuredAnalyticsItems]);

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

  return (
    <Theme3CartToastProvider>
      <div className="min-h-screen bg-[#fae9e6] text-rose-950">
        <div className="relative">
          <Theme3Navbar
            slug={slug}
            logoText={store.logoText || store.businessName}
          />
          <Theme3Announcement />
        </div>

        <section className="mx-auto mt-4 w-full max-w-470 px-3 sm:px-4">
          {/* Slider */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-black/10">
            <div
              className="relative aspect-16/11 w-full cursor-pointer overflow-hidden touch-pan-y sm:aspect-video xl:aspect-1898/742"
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
                    <div
                      key={`${item.imageUrl}-${index}`}
                      className="relative h-full w-full shrink-0"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={`${store.businessName}-${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 max-w-xl text-white sm:left-8 sm:right-auto md:bottom-10 md:left-12">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-[#cc5639]">
                            Necklace
                          </span>
                          <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-[#cc5639]">
                            Ring
                          </span>
                        </div>
                        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">
                          {item.title}
                        </h1>
                        <p className="mt-3 text-xs text-white/90 sm:text-sm md:text-base">
                          {item.description}
                        </p>
                        <Link
                          href={`/${slug}/product`}
                          className="mt-4 inline-block rounded-xl bg-[#cc5639] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#b84c32] sm:mt-6 sm:px-6 sm:py-3 sm:text-sm"
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
                <div className="absolute bottom-4 left-1/2 z-10 flex items-center gap-2 sm:bottom-7 ">
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
                          index === activeSlide
                            ? "w-10 bg-white"
                            : "w-6 bg-white/50"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              {sliderItems.length > 1 ? (
                <div className="absolute bottom-3 right-3 z-10 hidden gap-2 sm:bottom-6 sm:right-6 sm:flex">
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

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
            {collectionTiles.map((collection, index) => {
              const collectionSlug = toCollectionSlug(collection.label);
              const href = `/${slug}/product?categories=${encodeURIComponent(
                collectionSlug,
              )}`;

              return (
                <Link
                  key={`${collection.label}-${index}`}
                  href={href}
                  className="group relative aspect-6/3 overflow-hidden rounded-xl border border-rose-200 bg-white/70 text-left sm:aspect-20/8 xl:aspect-258/90"
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

        <section className="mx-auto mt-4 w-full bg-[#fcf5f4] px-3 py-8 sm:px-6">
          <div className="text-center">
            <span className="rounded-full bg-[#cc5639] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Just Dropped
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-rose-950 sm:text-3xl md:text-4xl">
              Sparkling New Pieces
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    </Theme3CartToastProvider>
  );
}

