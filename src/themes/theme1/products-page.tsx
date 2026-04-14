"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import {
  toAnalyticsItem,
  trackStorefrontEvent,
} from "@/lib/storefront-analytics/client";
import { Theme1Navbar } from "@/themes/theme1/navbar";
import { Theme1Footer } from "@/themes/theme1/footer";
import { Theme1CartToastProvider } from "@/themes/theme1/cart-toast";
import { Theme1ProductCard } from "@/themes/theme1/product-card";
import { Theme1ProductsFilters } from "@/themes/theme1/products-filters";
import { toCollectionSlug } from "@/themes/theme1/collection-utils";
import type { ThemeProductsProps } from "@/themes/types";

export function Theme1ProductsPage({
  slug,
  store,
  products,
}: ThemeProductsProps) {
  useCartStorage();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedProductIds, setAppliedProductIds] = useState<string[]>([]);
  const [appliedCategoriesOverride, setAppliedCategoriesOverride] = useState<
    string[] | null
  >(null);
  const [appliedFromPrice, setAppliedFromPrice] = useState("");
  const [appliedToPrice, setAppliedToPrice] = useState("");
  const [appliedDiscounts, setAppliedDiscounts] = useState<string[]>([]);
  const [draftProductIds, setDraftProductIds] = useState<string[]>([]);
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftFromPrice, setDraftFromPrice] = useState("");
  const [draftToPrice, setDraftToPrice] = useState("");
  const [draftDiscounts, setDraftDiscounts] = useState<string[]>([]);

  const productOptions = useMemo(
    () =>
      products
        .map((product) => ({
          id: product._id,
          value: product._id,
          label: product.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [products],
  );

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map<string, string>();

    products.forEach((product) => {
      const label = product.category?.trim() || "Uncategorized";
      const value = toCollectionSlug(label);
      if (!categoryMap.has(value)) {
        categoryMap.set(value, label);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([value, label]) => ({
        id: value,
        value,
        label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  const validCategoryValues = useMemo(
    () => new Set(categoryOptions.map((entry) => entry.value)),
    [categoryOptions],
  );

  const discountOptions = useMemo(() => {
    const discountRanges = Array.from(
      new Set(
        products
          .map((product) => Math.max(product.discountPercentage || 0, 0))
          .filter((value) => value > 0)
          .map((value) => {
            const end = Math.ceil(value / 10) * 10;
            const start = end === 10 ? 0 : end - 9;
            return `${start}-${end}`;
          }),
      ),
    ).sort((a, b) => {
      const [aStart] = a.split("-").map(Number);
      const [bStart] = b.split("-").map(Number);
      return aStart - bStart;
    });

    return discountRanges.map((range) => {
      const [start, end] = range.split("-").map(Number);
      return {
        id: `range-${range}`,
        value: range,
        label: `${start} - ${end}`,
      };
    });
  }, [products]);

  const priceBounds = useMemo(() => {
    const prices = products
      .map((product) => Number(product.price))
      .filter((value) => !Number.isNaN(value) && value >= 0);

    if (!prices.length) {
      return { min: 0, max: 100 };
    }

    const min = Math.floor(Math.min(...prices) * 100) / 100;
    const max = Math.ceil(Math.max(...prices) * 100) / 100;

    if (min === max) {
      return { min, max: min + 1 };
    }

    return { min, max };
  }, [products]);

  const categoriesFromQuery = useMemo(() => {
    const rawCategories = searchParams.get("categories") || "";
    if (!rawCategories.trim()) {
      return [];
    }

    return rawCategories
      .split(",")
      .map((value) => toCollectionSlug(value))
      .filter((value) => validCategoryValues.has(value));
  }, [searchParams, validCategoryValues]);

  const activeAppliedCategories =
    appliedCategoriesOverride ?? categoriesFromQuery;

  const filteredProducts = useMemo(() => {
    const hasFrom = appliedFromPrice.trim() !== "";
    const hasTo = appliedToPrice.trim() !== "";
    const from = Number(appliedFromPrice);
    const to = Number(appliedToPrice);

    return products.filter((product) => {
      if (
        appliedProductIds.length &&
        !appliedProductIds.includes(product._id)
      ) {
        return false;
      }

      const productCategory = toCollectionSlug(
        product.category || "uncategorized",
      );
      if (
        activeAppliedCategories.length &&
        !activeAppliedCategories.includes(productCategory)
      ) {
        return false;
      }

      if (hasFrom && !Number.isNaN(from) && product.price < from) {
        return false;
      }

      if (hasTo && !Number.isNaN(to) && product.price > to) {
        return false;
      }

      if (appliedDiscounts.length) {
        const productDiscount = Math.max(product.discountPercentage || 0, 0);
        const selectedRanges = appliedDiscounts
          .map((value) => value.split("-").map(Number))
          .filter(
            (value): value is [number, number] =>
              value.length === 2 &&
              !Number.isNaN(value[0]) &&
              !Number.isNaN(value[1]),
          );

        if (
          !selectedRanges.length ||
          productDiscount <= 0 ||
          !selectedRanges.some(
            ([start, end]) =>
              productDiscount >= start && productDiscount <= end,
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    products,
    appliedProductIds,
    activeAppliedCategories,
    appliedFromPrice,
    appliedToPrice,
    appliedDiscounts,
  ]);

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

  const listingAnalyticsItems = useMemo(
    () =>
      sortedProducts.slice(0, 20).map((product) =>
        toAnalyticsItem({
          productId: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: 1,
        }),
      ),
    [sortedProducts],
  );

  useEffect(() => {
    if (!listingAnalyticsItems.length) return;

    trackStorefrontEvent({
      event: "view_item_list",
      slug,
      storeTheme: "theme1",
      item_list_name: "products_listing",
      ecommerce: {
        currency: sortedProducts[0]?.currency || "INR",
        items: listingAnalyticsItems,
      },
    });
  }, [slug, sortedProducts, listingAnalyticsItems]);

  function openFilters() {
    setDraftProductIds(appliedProductIds);
    setDraftCategories(activeAppliedCategories);
    setDraftFromPrice(appliedFromPrice);
    setDraftToPrice(appliedToPrice);
    setDraftDiscounts(appliedDiscounts);
    setIsFilterOpen(true);
  }

  function clearDraftFilters() {
    setDraftProductIds([]);
    setDraftCategories([]);
    setDraftFromPrice("");
    setDraftToPrice("");
    setDraftDiscounts([]);
  }

  function applyFilters() {
    setAppliedProductIds(draftProductIds);
    setAppliedCategoriesOverride(draftCategories);
    setAppliedFromPrice(draftFromPrice.trim());
    setAppliedToPrice(draftToPrice.trim());
    setAppliedDiscounts(draftDiscounts);
    setIsFilterOpen(false);
  }

  return (
    <Theme1CartToastProvider>
      <div className="min-h-screen font-['Helvetica'] bg-slate-100 text-slate-900">
        <Theme1Navbar
          slug={slug}
          logoText={store.logoText || store.businessName}
        />

        <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-white px-3 py-4 sm:px-4 sm:py-5">
          <section className="mt-2">
            <div className="flex flex-row gap-6 sm:flex-row sm:items-center sm:justify-between">
              <Theme1ProductsFilters
                isOpen={isFilterOpen}
                productOptions={productOptions}
                categoryOptions={categoryOptions}
                discountOptions={discountOptions}
                minPrice={priceBounds.min}
                maxPrice={priceBounds.max}
                selectedProducts={draftProductIds}
                selectedCategories={draftCategories}
                selectedDiscounts={draftDiscounts}
                fromPrice={draftFromPrice}
                toPrice={draftToPrice}
                onOpen={openFilters}
                onClose={() => setIsFilterOpen(false)}
                onChangeProducts={setDraftProductIds}
                onChangeCategories={setDraftCategories}
                onChangeDiscounts={setDraftDiscounts}
                onChangeFromPrice={setDraftFromPrice}
                onChangeToPrice={setDraftToPrice}
                onClear={clearDraftFilters}
                onApply={applyFilters}
              />

              <div className="flex w-full flex-wrap items-center gap-3 text-sm text-slate-800 sm:w-auto sm:justify-end">
                <span className="text-xs">
                  Products: {sortedProducts.length}
                </span>
                <label className="inline-flex items-center gap-2">
                  Sort by:
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2"
                  >
                    <option value="featured">Best selling</option>
                    <option value="price-asc">Price low to high</option>
                    <option value="price-desc">Price high to low</option>
                    <option value="name">Name</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <Theme1ProductCard
                  key={product._id}
                  slug={slug}
                  product={product}
                />
              ))}
            </div>

            {!sortedProducts.length ? (
              <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-700">
                No products found for selected filters.
              </p>
            ) : null}
          </section>
        </main>

        <Theme1Footer
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
    </Theme1CartToastProvider>
  );
}



