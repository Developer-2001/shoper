"use client";

import Image from "next/image";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3CartItems } from "@/themes/theme3/cart-items";
import type { ThemeCartProps } from "@/themes/types";
import { isVideoUrl } from "@/utils/media";

const THEME3_BANNER_MEDIA =
  "https://storage.googleapis.com/canada-ecommerce-assets/skl/themeimages/slider1-1774845449106.webp";

export function Theme3CartPage({ slug, store }: ThemeCartProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950">
      <Theme3Navbar
        slug={slug}
        logoText={store.logoText || store.businessName}
      />

      <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-[#eef0f2] px-2 py-3 md:px-4 md:py-4">
        <section className="relative overflow-hidden rounded-2xl border border-rose-200 bg-[#3f0e07]">
          <div className="relative aspect-1898/520 w-full">
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
              <h1 className="text-[52px] font-semibold leading-tight md:text-[64px]">
                Cart
              </h1>
              <p className="mt-2 max-w-3xl text-[18px] text-white/95 md:text-[20px]">
                Nourish your skin daily with gentle care for a natural, radiant
                glow.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <Theme3CartItems slug={slug} />
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
