"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import type { StorefrontStore } from "@/themes/types";
import Image from "next/image";
import { isVideoUrl } from "@/utils/media";

type Theme3TermsPageProps = {
  slug: string;
  store: StorefrontStore;
};

export function Theme3TermsPage({ slug, store }: Theme3TermsPageProps) {
  useCartStorage();

  const THEME3_BANNER_MEDIA =
    "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/slider1-1774845449106.webp";

  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950">
      <Theme3Navbar
        slug={slug}
        logoText={store.logoText || store.businessName}
      />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-[#eef0f2] px-3 py-3 sm:px-4 sm:py-4">
        <section className="relative overflow-hidden rounded-2xl border border-rose-200">
          <div className="relative aspect-[16/9] w-full sm:aspect-[16/7] xl:aspect-1898/520">
            {isVideoUrl(THEME3_BANNER_MEDIA) ? (
              <video
                src={THEME3_BANNER_MEDIA}
                className="h-full w-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <Image
                src={THEME3_BANNER_MEDIA}
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
        <div className="mt-4 rounded-xl border border-rose-100 bg-white/70 p-4 sm:p-5 md:p-6">
          <h1 className="text-lg font-semibold text-[#2f1f1a] sm:text-xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-[#735953]">
            Last updated: April 1, 2026
          </p>

          <div className="mt-6 space-y-6 text-sm leading-7 text-[#513a34] sm:mt-8 sm:space-y-8 sm:text-base sm:leading-8">
            <section>
              <h2 className="text-lg font-semibold text-[#2f1f1a] sm:text-xl">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By using this store, you agree to these terms and all applicable
                policies. If you do not agree, please do not use the site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#2f1f1a] sm:text-xl">
                2. Orders and Payments
              </h2>
              <p className="mt-3">
                Orders are confirmed only after successful payment. We reserve
                the right to cancel orders in case of fraud detection, stock
                mismatch, or pricing errors.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#2f1f1a] sm:text-xl">
                3. Product Information
              </h2>
              <p className="mt-3">
                We aim to keep all product details accurate, including pricing,
                material descriptions, and images. Minor variations may occur.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[#2f1f1a] sm:text-xl">
                4. Contact
              </h2>
              <p className="mt-3">
                For any legal or terms-related query, email us at{" "}
                <span className="font-semibold text-[#2f1f1a]">
                  {store.contactEmail || "support@example.com"}
                </span>
                .
              </p>
            </section>
          </div>
        </div>
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
