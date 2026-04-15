"use client";

import Image from "next/image";
import { LayoutGrid, Rows3 } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2ProductCard } from "@/themes/theme2/product-card";
import { Theme2CartToastProvider } from "@/themes/theme2/cart-toast";
import { categoryMatchesCollectionSlug, toCollectionSlug } from "@/themes/theme2/collection-utils";
import { THEME2_COLLECTION_HERO } from "@/themes/theme2/theme2-config";
import type { ThemeProductsProps } from "@/themes/types";

export function Theme2ProductsPage({ slug, store, products }: ThemeProductsProps) {
  useCartStorage();
  const searchParams = useSearchParams();

  const categoryFilter = searchParams.get("categories")?.trim() || "";

  const filteredProducts = useMemo(() => {
    if (!categoryFilter) {
      return products;
    }

    const targets = categoryFilter
      .split(",")
      .map((item) => toCollectionSlug(item))
      .filter(Boolean);

    if (!targets.length) {
      return products;
    }

    return products.filter((product) => targets.some((target) => categoryMatchesCollectionSlug(product.category, target)));
  }, [products, categoryFilter]);

  return (
    <Theme2CartToastProvider>
      <div className="min-h-screen bg-[#f4f4f1] text-[#263833]">
        <Theme2Navbar slug={slug} logoText={store.logoText || "PRESENT DAY"} />

      <main className="pb-8">
        <section className="mx-auto mt-4 w-full max-w-7xl px-4">
          <div className="relative overflow-hidden border border-[#b6bebb]">
            <Image
              src={THEME2_COLLECTION_HERO.imageUrl}
              alt="Full collection"
              width={1800}
              height={820}
              className="h-[200px] w-full object-cover sm:h-[280px] lg:h-[320px]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-black/10" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white sm:left-8">
              <h1 className="text-4xl leading-none [font-family:var(--font-theme2-serif)] sm:text-6xl">
                {THEME2_COLLECTION_HERO.title}
              </h1>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] sm:text-sm">{THEME2_COLLECTION_HERO.subtitle}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4">
          <div className="mb-5 flex items-center justify-between border-b border-[#c7cecb] pb-3">
            <p className="text-sm uppercase tracking-[0.16em] text-[#3e504d]">{filteredProducts.length} products</p>
            <div className="flex items-center gap-3 text-[#435652]">
              <button type="button" className="rounded border border-[#c8cfcc] p-1.5" aria-label="Grid layout">
                <LayoutGrid size={16} />
              </button>
              <button type="button" className="rounded border border-[#c8cfcc] p-1.5" aria-label="List layout">
                <Rows3 size={16} />
              </button>
            </div>
          </div>

          {filteredProducts.length ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <Theme2ProductCard key={product._id} slug={slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#b9c1be] bg-white px-4 py-12 text-center text-[#4f615e]">
              No products found for the selected collection.
            </div>
          )}
        </section>
      </main>

        <Theme2Footer
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
    </Theme2CartToastProvider>
  );
}
