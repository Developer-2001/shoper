"use client";

import Image from "next/image";
import Link from "next/link";
import { MoveLeft, MoveRight } from "lucide-react";
import { useMemo, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import {
  SHARED_THEME_IMAGE_URL,
  SHARED_THEME_MEDIA_LIST,
  THEME3_ANNOUNCEMENT_TEXT,
  THEME3_COLLECTION_LABELS,
  THEME3_FEATURED_HEADING,
} from "@/themes/theme-defaults";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3ProductCard } from "@/themes/theme3/product-card";
import { toCollectionSlug } from "@/themes/theme3/collection-utils";
import type { ThemeHomeProps } from "@/themes/types";
import { isVideoUrl } from "@/utils/media";

const MAX_COLLECTION_CARDS = 8;

export function Theme3Home({ slug, store, products }: ThemeHomeProps) {
  useCartStorage();

  const sliderMedia = SHARED_THEME_MEDIA_LIST;
  const [activeSlide, setActiveSlide] = useState(0);

  const collections = THEME3_COLLECTION_LABELS;
  const collectionImages = useMemo(() => {
    return Array.from({ length: MAX_COLLECTION_CARDS }, () => SHARED_THEME_IMAGE_URL);
  }, []);
  const collectionTiles = useMemo(() => {
    const size = Math.min(
      MAX_COLLECTION_CARDS,
      Math.max(collections.length, collectionImages.length, THEME3_COLLECTION_LABELS.length),
    );

    return Array.from({ length: size }, (_, index) => ({
      label: collections[index] || THEME3_COLLECTION_LABELS[index] || `Collection ${index + 1}`,
      imageUrl: collectionImages[index] || "",
    }));
  }, [collections, collectionImages]);
  const availableCollectionSlugs = useMemo(
    () =>
      new Set(
        products.map((product) =>
          toCollectionSlug(product.category || "uncategorized"),
        ),
      ),
    [products],
  );

  const activeMedia = sliderMedia[activeSlide] || "";
  const featuredProducts = products.slice(0, 4);
  const announcementText = THEME3_ANNOUNCEMENT_TEXT;

  function goPrev() {
    if (!sliderMedia.length) return;
    setActiveSlide((prev) => (prev - 1 + sliderMedia.length) % sliderMedia.length);
  }

  function goNext() {
    if (!sliderMedia.length) return;
    setActiveSlide((prev) => (prev + 1) % sliderMedia.length);
  }

  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950">
      <div className="mx-auto w-full max-w-3xl rounded-b-[28px] bg-[#cc5639] px-6 py-2 text-center text-sm font-semibold text-white">
        {announcementText}
      </div>

      <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <section className="mx-auto mt-6 w-full max-w-475 px-4">
          <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-black/10">
            <div className="relative aspect-1898/742 w-full">
              {activeMedia ? (
                isVideoUrl(activeMedia) ? (
                  <video src={activeMedia} className="h-full w-full object-cover" muted autoPlay loop playsInline controls />
                ) : (
                  <Image src={activeMedia} alt={store.businessName} fill className="object-cover" sizes="100vw" />
                )
              ) : (
                <div className="grid h-full w-full place-items-center text-rose-300">Add slider media (1898x742)</div>
              )}

              <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/20 to-transparent" />
              <div className="absolute left-8 top-8 max-w-xl text-white md:left-12 md:top-14">
                <div className="mb-4 flex gap-2">
                  <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-[#cc5639]">Necklace</span>
                  <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-[#cc5639]">Ring</span>
                </div>
                <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Elevate Your Style with the Perfect Accessory</h1>
                <p className="mt-4 text-sm text-white/90 md:text-base">
                  From everyday essentials to statement pieces, discover accessories that add the perfect finishing touch.
                </p>
                <Link
                  href={`/${slug}/collections`}
                  className="mt-6 inline-block rounded-xl bg-[#cc5639] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b84c32]"
                >
                  Shop Now
                </Link>
              </div>

              {sliderMedia.length > 1 ? (
                <div className="absolute bottom-6 right-6 flex gap-2">
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
          <span className="rounded-full bg-[#cc5639] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">Just Dropped</span>
          <h2 className="mt-4 text-4xl font-semibold text-rose-950">
            {THEME3_FEATURED_HEADING}
          </h2>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <Theme3ProductCard key={product._id} slug={slug} product={product} />
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
