"use client";

import { useState, type FormEvent } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { trackStorefrontEvent } from "@/lib/storefront-analytics/client";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import type { StorefrontStore } from "@/themes/types";
import Image from "next/image";
import { isVideoUrl } from "@/utils/media";

type Theme3ContactPageProps = {
  slug: string;
  store: StorefrontStore;
};

export function Theme3ContactPage({ slug, store }: Theme3ContactPageProps) {
  useCartStorage();

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    trackStorefrontEvent({
      event: "generate_lead",
      slug,
      storeTheme: "theme3",
      lead_type: "store_contact",
      form_name: "contact_form",
      page_type: "contact",
    });
  }
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
                Contact Us
              </h1>
              <p className="mt-2 max-w-3xl text-xs text-white/95 sm:text-sm md:text-base">
                Nourish your skin daily with gentle care for a natural, radiant
                glow.
              </p>
            </div>
          </div>
        </section>
        <div className="mt-4 rounded-2xl border border-rose-100 bg-white/70 p-4 sm:p-5 md:p-6">
          <h1 className="text-xl font-semibold text-[#2f1f1a] sm:text-2xl">Contact Us</h1>
          <p className="mt-3 max-w-2xl text-[#5f4d47]">
            We would love to hear from you. Reach out for order help, product
            details, or anything else.
          </p>

          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-2 rounded-2xl border border-rose-100 bg-[#fff8f7] p-5"
            >
              <div className="space-y-1">
                <label
                  htmlFor="contact-name"
                  className="text-sm font-semibold text-[#2f1f1a]"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  required
                  className="w-full rounded-xl border border-rose-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="contact-email"
                  className="text-sm font-semibold text-[#2f1f1a]"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-rose-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-rose-300"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-semibold text-[#2f1f1a]"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={3}
                  required
                  className="w-full rounded-xl border border-rose-200 bg-slate-50 px-4 py-2.5 outline-none transition focus:border-rose-300"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#cc5639] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b94d31]"
              >
                Send message
              </button>
              {submitted ? (
                <p className="text-sm font-medium text-emerald-700">
                  Thanks. We received your message.
                </p>
              ) : null}
            </form>

            <aside className="space-y-4 rounded-2xl border border-rose-100 bg-[#fff8f7] p-5">
              <h2 className="text-xl font-semibold text-[#2f1f1a]">
                Store Contact
              </h2>
              <p className="text-sm text-[#5f4d47]">
                Email:{" "}
                <span className="font-semibold text-[#2f1f1a]">
                  {store.contactEmail || "support@example.com"}
                </span>
              </p>
              <p className="text-sm text-[#5f4d47]">
                Phone:{" "}
                <span className="font-semibold text-[#2f1f1a]">
                  {store.contactPhone || "Not provided"}
                </span>
              </p>
              <p className="text-sm text-[#5f4d47]">
                Address:{" "}
                <span className="font-semibold text-[#2f1f1a]">
                  {store.address || "Address not provided"}
                </span>
              </p>
            </aside>
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
