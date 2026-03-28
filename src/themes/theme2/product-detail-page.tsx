"use client";

import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2ProductDetail } from "@/themes/theme2/product-detail";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme2ProductDetailPage({ slug, store, product }: ThemeProductDetailProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8e7_0%,#fff 45%)] text-amber-950">
      <Theme2Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <Theme2ProductDetail slug={slug} store={store} product={product} />
      </main>

      <Theme2Footer
        slug={slug}
        companyName={store.businessName}
        about={store.about}
        address={store.address}
        contactEmail={store.contactEmail}
        contactPhone={store.contactPhone}
        footerLinks={store.footerLinks || []}
      />
    </div>
  );
}
