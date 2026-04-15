"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme2CartItems } from "@/themes/theme2/cart-items";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import type { ThemeCartProps } from "@/themes/types";

export function Theme2CartPage({ slug, store }: ThemeCartProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#2d3f3c]">
      <Theme2Navbar slug={slug} logoText={store.logoText || "PRESENT DAY"} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
       
        <div className="mt-2">
          <Theme2CartItems slug={slug} />
        </div>
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
  );
}
