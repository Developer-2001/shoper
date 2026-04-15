"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme2CheckoutForm } from "@/themes/theme2/checkout-form";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import type { ThemeCheckoutProps } from "@/themes/types";

export function Theme2CheckoutPage({ slug, store }: ThemeCheckoutProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-[#f3f4f5] text-[#2c3f3b]">
      <Theme2Navbar slug={slug} logoText={store.logoText || "PRESENT DAY"} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Theme2CheckoutForm slug={slug} store={store} />
      </main>
    </div>
  );
}
