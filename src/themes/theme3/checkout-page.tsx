"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3CheckoutForm } from "@/themes/theme3/checkout-form";
import type { ThemeCheckoutProps } from "@/themes/types";

export function Theme3CheckoutPage({ slug, store }: ThemeCheckoutProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-470 px-3 py-4 sm:px-4">
        <Theme3CheckoutForm slug={slug} store={store} />
      </main>

      
    </div>
  );
}

