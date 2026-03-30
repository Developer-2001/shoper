"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3CartItems } from "@/themes/theme3/cart-items";
import type { ThemeCartProps } from "@/themes/types";

export function Theme3CartPage({ slug, store }: ThemeCartProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-[#fff2f5] text-rose-950">
      <div className="mx-auto w-full max-w-3xl rounded-b-[28px] bg-[#cc5639] px-6 py-2 text-center text-sm font-semibold text-white">
        Free Shipping On Orders Over $200
      </div>
      <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-semibold">Your Cart</h1>
        <div className="mt-6">
          <Theme3CartItems slug={slug} />
        </div>
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

