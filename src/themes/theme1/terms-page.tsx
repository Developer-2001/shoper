"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme1Footer } from "@/themes/theme1/footer";
import { Theme1Navbar } from "@/themes/theme1/navbar";
import type { StorefrontStore } from "@/themes/types";
import Image from "next/image";
import { isVideoUrl } from "@/utils/media";

type Theme1TermsPageProps = {
  slug: string;
  store: StorefrontStore;
};

export function Theme1TermsPage({ slug, store }: Theme1TermsPageProps) {
  useCartStorage();

  const Theme1_BANNER_MEDIA =
    "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/slider1-1774845449106.webp";

  return (
    <div className="min-h-screen font-['Helvetica'] bg-slate-100 text-slate-900">
      <Theme1Navbar
        slug={slug}
        logoText={store.logoText || store.businessName}
      />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200">
          <div className="relative aspect-video w-full sm:aspect-16/7 xl:aspect-1898/520">
            {isVideoUrl(Theme1_BANNER_MEDIA) ? (
              <video
                src={Theme1_BANNER_MEDIA}
                className="h-full w-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <Image
                src={Theme1_BANNER_MEDIA}
                alt="Cart banner"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            )}
            <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
              <h1 className="text-lg font-semibold leading-tight sm:text-xl md:text-2xl">
                Terms and Conditions
              </h1>
              <p className="mt-2 max-w-3xl text-xs text-white/95 sm:text-sm md:text-base">
                Nourish your skin daily with gentle care for a natural, radiant
                glow.
              </p>
            </div>
          </div>
        </section>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4 sm:p-5 md:p-6">
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Last updated: April 1, 2026
          </p>

          <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700 sm:mt-8 sm:space-y-8 sm:text-base sm:leading-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By using this store, you agree to these terms and all applicable
                policies. If you do not agree, please do not use the site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                2. Orders and Payments
              </h2>
              <p className="mt-3">
                Orders are confirmed only after successful payment. We reserve
                the right to cancel orders in case of fraud detection, stock
                mismatch, or pricing errors.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                3. Product Information
              </h2>
              <p className="mt-3">
                We aim to keep all product details accurate, including pricing,
                material descriptions, and images. Minor variations may occur.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                4. Contact
              </h2>
              <p className="mt-3">
                For any legal or terms-related query, email us at{" "}
                <span className="font-semibold text-slate-900">
                  {store.contactEmail || "support@example.com"}
                </span>
                .
              </p>
            </section>
          </div>
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




