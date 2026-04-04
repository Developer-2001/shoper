"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme1Navbar } from "@/themes/theme1/navbar";
import { Theme1CheckoutForm } from "@/themes/theme1/checkout-form";
import type { ThemeCheckoutProps } from "@/themes/types";

export function Theme1CheckoutPage({ slug, store }: ThemeCheckoutProps) {
  useCartStorage();

  return (
    <div className="min-h-screen font-['Helvetica'] bg-slate-100 text-slate-900">
      <Theme1Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-470 px-3 py-4 sm:px-4">
        <Theme1CheckoutForm slug={slug} store={store} />
      </main>

      
    </div>
  );
}





