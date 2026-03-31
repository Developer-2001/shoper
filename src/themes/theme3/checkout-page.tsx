"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3CheckoutForm } from "@/themes/theme3/checkout-form";
import type { ThemeCheckoutProps } from "@/themes/types";

export function Theme3CheckoutPage({ slug, store }: ThemeCheckoutProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-[#eef0f2] text-rose-950">
      <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-470 px-2 py-4 md:px-4">
        <Theme3CheckoutForm slug={slug} store={store} />
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

