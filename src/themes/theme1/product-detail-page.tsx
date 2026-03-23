"use client";

import { StorefrontNavbar } from "@/components/storefront/storefront-navbar";
import { DynamicStoreFooter } from "@/components/storefront/dynamic-store-footer";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme1ProductDetailPage({ slug, store, product }: ThemeProductDetailProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontNavbar logoText={store.logoText || store.businessName} slug={slug} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <ProductDetailClient slug={slug} product={product} />
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
