"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2CheckoutForm } from "@/themes/theme2/checkout-form";
import type { ThemeCheckoutProps } from "@/themes/types";

export function Theme2CheckoutPage({ slug, store }: ThemeCheckoutProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8e7_0%,#fff 45%)] text-amber-950">
      <Theme2Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-black uppercase">Checkout</h1>
        <div className="mt-6">
          <Theme2CheckoutForm slug={slug} />
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
      />
    </div>
  );
}
