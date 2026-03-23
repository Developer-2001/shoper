"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontNavbar } from "@/components/storefront/storefront-navbar";
import { DynamicStoreFooter } from "@/components/storefront/dynamic-store-footer";
import type { ThemeProductsProps } from "@/themes/types";

export function Theme1ProductsPage({ slug, store, products }: ThemeProductsProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontNavbar logoText={store.logoText || store.businessName} slug={slug} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-black text-slate-900">All Products</h1>
        <p className="mt-2 text-slate-600">Browse every published product from {store.businessName}.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
