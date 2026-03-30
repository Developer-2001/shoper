"use client";

import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3ProductDetail } from "@/themes/theme3/product-detail";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme3ProductDetailPage({ slug, store, product }: ThemeProductDetailProps) {
  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950">
      <div className="mx-auto w-full max-w-3xl rounded-b-[28px] bg-[#cc5639] px-6 py-2 text-center text-sm font-semibold text-white">
        Free Shipping On Orders Over $200
      </div>
      <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full rounded-t-2xl bg-[#fcf5f4]  px-2 py-4">
        <Theme3ProductDetail slug={slug} store={store} product={product} />
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

