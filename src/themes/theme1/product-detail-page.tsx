"use client";

import { Theme1Navbar } from "@/themes/theme1/navbar";
import { Theme1Footer } from "@/themes/theme1/footer";
import { Theme1ProductDetail } from "@/themes/theme1/product-detail";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme1ProductDetailPage({ slug, store, product }: ThemeProductDetailProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Theme1Navbar logoText={store.logoText || store.businessName} slug={slug} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <Theme1ProductDetail slug={slug} product={product} />
      </main>

      <Theme1Footer
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
