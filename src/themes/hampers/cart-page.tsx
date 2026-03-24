"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { CartItems } from "@/components/storefront/cart-items";
import { DynamicStoreFooter } from "@/components/storefront/dynamic-store-footer";
import { HampersNavbar } from "@/themes/hampers/hampers-navbar";
import type { ThemeCartProps } from "@/themes/types";

export function HampersCartPage({ slug, store }: ThemeCartProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-amber-50/30">
      <HampersNavbar logoText={store.logoText || store.businessName} slug={slug} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-black text-stone-900">Your Cart</h1>
        <div className="mt-6">
          <CartItems slug={slug} />
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
