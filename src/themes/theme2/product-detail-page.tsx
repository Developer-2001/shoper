"use client";

import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2ProductDetail } from "@/themes/theme2/product-detail";
import { Theme2CartToastProvider } from "@/themes/theme2/cart-toast";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme2ProductDetailPage({ slug, store, product }: ThemeProductDetailProps) {
  return (
    <Theme2CartToastProvider>
      <div className="min-h-screen bg-[#f4f4f1] text-[#233532]">
        <Theme2Navbar slug={slug} logoText={store.logoText || "PRESENT DAY"} />

        <main className="mx-auto w-full max-w-6xl px-4 py-8">
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
          socialLinks={store.socialLinks}
        />
      </div>
    </Theme2CartToastProvider>
  );
}
