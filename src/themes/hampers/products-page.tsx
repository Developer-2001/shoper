"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { ProductCard } from "@/components/storefront/product-card";
import { DynamicStoreFooter } from "@/components/storefront/dynamic-store-footer";
import { HampersNavbar } from "@/themes/hampers/hampers-navbar";
import type { ThemeProductsProps } from "@/themes/types";

export function HampersProductsPage({ slug, store, products }: ThemeProductsProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-amber-50/30">
      <HampersNavbar logoText={store.logoText || store.businessName} slug={slug} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
          Our Range
        </p>
        <h1 className="mt-1 text-3xl font-black text-stone-900">All Products</h1>
        <p className="mt-2 text-stone-500">
          Browse every published product from {store.businessName}.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} slug={slug} product={product} />
          ))}
        </div>
      </main>

      <DynamicStoreFooter
        slug={slug}
        companyName={store.businessName}
        about={store.about}
        address={store.address}
        contactEmail={store.contactEmail}
        contactPhone={store.contactPhone}
        socialLinks={store.socialLinks}
        footerLinks={store.footerLinks || []}
      />
    </div>
  );
}
