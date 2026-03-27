"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme1Navbar } from "@/themes/theme1/navbar";
import { Theme1CheckoutForm } from "@/themes/theme1/checkout-form";
import { Theme1Footer } from "@/themes/theme1/footer";
import type { ThemeCheckoutProps } from "@/themes/types";

export function Theme1CheckoutPage({ slug, store }: ThemeCheckoutProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <Theme1Navbar logoText={store.logoText || store.businessName} slug={slug} />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <div className="mt-6">
          <Theme1CheckoutForm slug={slug} />
        </div>
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
