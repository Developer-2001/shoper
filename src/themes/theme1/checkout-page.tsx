"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { StorefrontNavbar } from "@/components/storefront/storefront-navbar";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { DynamicStoreFooter } from "@/components/storefront/dynamic-store-footer";
import type { ThemeCheckoutProps } from "@/themes/types";

export function Theme1CheckoutPage({ slug, store }: ThemeCheckoutProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontNavbar logoText={store.logoText || store.businessName} slug={slug} />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <div className="mt-6">
          <CheckoutForm slug={slug} />
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
