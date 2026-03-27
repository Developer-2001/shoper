"use client";

import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3ProductCard } from "@/themes/theme3/product-card";
import type { StorefrontProduct, StorefrontStore } from "@/themes/types";
import { isVideoUrl } from "@/utils/media";

type Theme3CollectionProductsPageProps = {
  slug: string;
  store: StorefrontStore;
  categoryLabel: string;
  categorySlug: string;
  categoryProducts: StorefrontProduct[];
};

export function Theme3CollectionProductsPage({
  slug,
  store,
  categoryLabel,
  categorySlug,
  categoryProducts,
}: Theme3CollectionProductsPageProps) {
  useCartStorage();

  const [sortBy, setSortBy] = useState("featured");
  const bannerMedia = store.theme.sliderImages?.[0] || "";

  const sortedProducts = useMemo(() => {
    if (sortBy === "price-asc") {
      return [...categoryProducts].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...categoryProducts].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "name") {
      return [...categoryProducts].sort((a, b) => a.name.localeCompare(b.name));
    }
    return categoryProducts;
  }, [categoryProducts, sortBy]);

  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950">
      <div className="mx-auto w-full max-w-3xl rounded-b-[28px] bg-[#cc5639] px-6 py-2 text-center text-sm font-semibold text-white">
        {store.theme.theme3?.announcementText || "Free Shipping On Orders Over $200"}
      </div>

      <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-470 px-2 py-5 md:px-4  rounded-t-2xl bg-[#fcf5f4]">
        <section className="relative overflow-hidden rounded-2xl border border-rose-200 bg-[#fcf5f4]">
          <div className="relative aspect-1898/420 w-full">
            {bannerMedia ? (
              isVideoUrl(bannerMedia) ? (
                <video
                  src={bannerMedia}
                  className="h-full w-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={bannerMedia}
                  alt={categoryLabel}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              )
            ) : (
              <div className="grid h-full w-full place-items-center text-rose-200">
                Add slider media in Configure Store
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white md:left-8">
              <h1 className="text-5xl font-semibold leading-tight">{categoryLabel}</h1>
              <p className="mt-2 text-sm text-white/90 md:text-xl">
                Discover the complete collection where timeless elegance meets modern sophistication.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-800"
            >
              <SlidersHorizontal size={16} />
              Filter
            </button>

            <div className="flex items-center gap-3 text-sm text-rose-900">
              <span>Total products: {categoryProducts.length}</span>
              <label className="inline-flex items-center gap-2">
                Sort by:
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2"
                >
                  <option value="featured">Best selling</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {sortedProducts.map((product) => (
              <Theme3ProductCard
                key={product._id}
                slug={slug}
                product={product}
                href={`/${slug}/collections/${categorySlug}/${product._id}`}
              />
            ))}
          </div>

          {!sortedProducts.length ? (
            <p className="mt-8 rounded-2xl border border-dashed border-rose-300 p-6 text-center text-rose-800">
              No products found in this collection.
            </p>
          ) : null}
        </section>
      </main>

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
