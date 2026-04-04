"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme1Navbar } from "@/themes/theme1/navbar";
import { Theme1Footer } from "@/themes/theme1/footer";
import { Theme1CartItems } from "@/themes/theme1/cart-items";
import type { ThemeCartProps } from "@/themes/types";

export function Theme1CartPage({ slug, store }: ThemeCartProps) {
  useCartStorage();

  return (
    <div className="min-h-screen font-['Helvetica'] bg-slate-100 text-slate-900">
      <Theme1Navbar
        slug={slug}
        logoText={store.logoText || store.businessName}
      />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
        <div className="mt-2">
          <Theme1CartItems slug={slug} />
        </div>
      </main>

      <Theme1Footer
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




