"use client";

import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3CartToastProvider } from "@/themes/theme3/cart-toast";
import { Theme3ProductDetail } from "@/themes/theme3/product-detail";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme3ProductDetailPage({ slug, store, product }: ThemeProductDetailProps) {
  return (
    <Theme3CartToastProvider>
      <div className="min-h-screen bg-[#fae9e6] text-rose-950">
        <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

        <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-[#fcf5f4] px-3 py-4 sm:px-4">
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
    </Theme3CartToastProvider>
  );
}

