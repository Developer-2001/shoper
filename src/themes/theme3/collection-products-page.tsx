"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3CartToastProvider } from "@/themes/theme3/cart-toast";
import { Theme3CollectionFilters } from "@/themes/theme3/collection-filters";
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFromPrice, setAppliedFromPrice] = useState("");
  const [appliedToPrice, setAppliedToPrice] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);
  const [draftFromPrice, setDraftFromPrice] = useState("");
  const [draftToPrice, setDraftToPrice] = useState("");
  const [draftDiscount, setDraftDiscount] = useState<number | null>(null);
  const bannerMedia =
    "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/slider1-1774845449106.webp";
  const discountOptions = [10, 20, 30, 40, 50];

  const filteredProducts = useMemo(() => {
    const hasFrom = appliedFromPrice.trim() !== "";
    const hasTo = appliedToPrice.trim() !== "";
    const from = Number(appliedFromPrice);
    const to = Number(appliedToPrice);

    return categoryProducts.filter((product) => {
      if (hasFrom && !Number.isNaN(from) && product.price < from) {
        return false;
      }
      if (hasTo && !Number.isNaN(to) && product.price > to) {
        return false;
      }
      if (
        appliedDiscount !== null &&
        (product.discountPercentage || 0) > appliedDiscount
      ) {
        return false;
      }
      return true;
    });
  }, [categoryProducts, appliedFromPrice, appliedToPrice, appliedDiscount]);

  const sortedProducts = useMemo(() => {
    if (sortBy === "price-asc") {
      return [...filteredProducts].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...filteredProducts].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "name") {
      return [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filteredProducts;
  }, [filteredProducts, sortBy]);

  function openFilters() {
    setDraftFromPrice(appliedFromPrice);
    setDraftToPrice(appliedToPrice);
    setDraftDiscount(appliedDiscount);
    setIsFilterOpen(true);
  }

  function clearDraftFilters() {
    setDraftFromPrice("");
    setDraftToPrice("");
    setDraftDiscount(null);
  }

  function applyFilters() {
    setAppliedFromPrice(draftFromPrice.trim());
    setAppliedToPrice(draftToPrice.trim());
    setAppliedDiscount(draftDiscount);
    setIsFilterOpen(false);
  }

  return (
    <Theme3CartToastProvider>
      <div className="min-h-screen bg-[#fae9e6] text-rose-950">
        <Theme3Navbar
          slug={slug}
          logoText={store.logoText || store.businessName}
        />

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
              <h1 className="text-5xl font-semibold leading-tight">
                {categoryLabel}
              </h1>
              <p className="mt-2 text-sm text-white/90 md:text-xl">
                Discover the complete collection where timeless elegance meets
                modern sophistication.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Theme3CollectionFilters
              isOpen={isFilterOpen}
              fromPrice={draftFromPrice}
              toPrice={draftToPrice}
              selectedDiscount={draftDiscount}
              discountOptions={discountOptions}
              onOpen={openFilters}
              onClose={() => setIsFilterOpen(false)}
              onChangeFromPrice={setDraftFromPrice}
              onChangeToPrice={setDraftToPrice}
              onToggleDiscount={(value) =>
                setDraftDiscount((current) =>
                  current === value ? null : value,
                )
              }
              onClear={clearDraftFilters}
              onApply={applyFilters}
            />

            <div className="flex items-center gap-3 text-sm text-rose-900">
              <span>Total products: {sortedProducts.length}</span>
              <label className="inline-flex items-center gap-2">
                Sort by:
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-lg border border-[#fae9e6] bg-[#fae9e6] px-3 py-2"
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
    </Theme3CartToastProvider>
  );
}
