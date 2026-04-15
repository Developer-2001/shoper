"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2ProductCard } from "@/themes/theme2/product-card";
import { Theme2CartToastProvider } from "@/themes/theme2/cart-toast";
import { Theme2SectionHeading } from "@/themes/theme2/components/theme2-section-heading";
import {
  THEME2_CATALOGUE_BANNER,
  THEME2_CATEGORY_IMAGE_URLS,
  THEME2_FEATURED_IN,
  THEME2_HOME_HERO,
} from "@/themes/theme2/theme2-config";
import { categoryMatchesCollectionSlug, toCollectionSlug } from "@/themes/theme2/collection-utils";
import type { ThemeHomeProps } from "@/themes/types";

const FALLBACK_CATEGORY_LABELS = [
  "Gifts For All Occasions",
  "Wedding Gifts",
  "Corporate Gifts",
];

export function Theme2Home({ slug, store, products, categories = [] }: ThemeHomeProps) {
  useCartStorage();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroSlides = THEME2_HOME_HERO.length
    ? THEME2_HOME_HERO
    : [{
        imageUrl: "https://storage.googleapis.com/canada-ecommerce-assets/hamperforyou/themeimages/hampers-1a-1776170327368.png",
        title: "Gift Boxes & Baskets",
        subtitle: "Curated with fine local goods",
        ctaLabel: "See The Collection",
      }];

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveHeroIndex((previous) => (previous + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  const visibleHeroIndex = activeHeroIndex % heroSlides.length;
  const activeHero = heroSlides[visibleHeroIndex] || heroSlides[0];

  const categoryTiles = useMemo(() => {
    const labels = categories
      .map((category) => category.name?.trim())
      .filter((value): value is string => Boolean(value))
      .slice(0, 3);

    const resolvedLabels = labels.length
      ? [...labels, ...FALLBACK_CATEGORY_LABELS].slice(0, 3)
      : FALLBACK_CATEGORY_LABELS;

    return resolvedLabels.map((label, index) => ({
      label,
      imageUrl: THEME2_CATEGORY_IMAGE_URLS[index] || THEME2_CATEGORY_IMAGE_URLS[0],
      href: `/${slug}/product?categories=${encodeURIComponent(toCollectionSlug(label))}`,
    }));
  }, [categories, slug]);

  const featuredProducts = useMemo(() => {
    const productByCategory = products.find((product) =>
      categoryTiles.some((category) =>
        categoryMatchesCollectionSlug(product.category, toCollectionSlug(category.label)),
      ),
    );

    if (!productByCategory) {
      return products.slice(0, 4);
    }

    const ordered = [productByCategory, ...products.filter((item) => item._id !== productByCategory._id)];
    return ordered.slice(0, 4);
  }, [categoryTiles, products]);

  return (
    <Theme2CartToastProvider>
      <div className="min-h-screen bg-[#f4f4f1] text-[#263833]">
        <Theme2Navbar slug={slug} logoText={store.logoText || "PRESENT DAY"} />

      <main className="pb-8">
        <section className="mx-auto mt-4 w-full  px-4">
          <div className="relative overflow-hidden border border-[#b6bebb]">
            <Image
              key={activeHero.imageUrl}
              src={activeHero.imageUrl}
              alt="Gift boxes and baskets"
              width={1800}
              height={980}
              className="h-[240px] w-full object-cover sm:h-[360px] lg:h-[540px]"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
            <div className="absolute left-4 top-1/2 max-w-md -translate-y-1/2 text-white sm:left-8 lg:left-12">
              <h1 className="text-4xl leading-none [font-family:var(--font-theme2-serif)] sm:text-6xl lg:text-7xl">
                {activeHero.title}
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] sm:text-base">{activeHero.subtitle}</p>
              <Link
                href={`/${slug}/product`}
                className="mt-6 inline-flex items-center bg-[#9db597] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#8ca886]"
              >
                {activeHero.ctaLabel}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-4 text-center text-[#2d3f3b]">
          <p className="text-3xl [font-family:var(--font-theme2-serif)] sm:text-4xl">Local Toronto Delivery</p>
          <p className="mt-4 text-3xl [font-family:var(--font-theme2-serif)] sm:text-4xl">Shipping across Canada & United States</p>
        </section>

        <section className="mt-12">
          <Theme2SectionHeading title="Categories" />
          <div className="mx-auto mt-8 grid w-full max-w-6xl gap-6 px-4 md:grid-cols-3">
            {categoryTiles.map((category) => (
              <Link key={category.label} href={category.href} className="group relative overflow-hidden border border-[#d6dcd9]">
                <Image
                  src={category.imageUrl}
                  alt={category.label}
                  width={700}
                  height={500}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-4xl uppercase leading-tight tracking-[0.05em] text-white [font-family:var(--font-theme2-serif)]">
                  {category.label}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <Theme2SectionHeading title="Featured Products" />
          <div className="mx-auto mt-8 grid w-full max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Theme2ProductCard key={product._id} slug={slug} product={product} />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 w-full max-w-6xl px-4 text-center">
          <p className="text-xl uppercase tracking-[0.28em] text-[#334743]">Featured In</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {THEME2_FEATURED_IN.map((logo) => (
              <div
                key={logo}
                className="flex h-14 items-center justify-center border border-[#d6dcd9] bg-[#f8f8f6] px-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#556662]"
              >
                {logo}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-4">
          <div className="border-y border-[#b6bebb] py-12 text-center">
            <h2 className="text-5xl uppercase tracking-[0.08em] text-[#2c3d39] [font-family:var(--font-theme2-serif)] sm:text-6xl">
              {THEME2_CATALOGUE_BANNER.title}
            </h2>
            <p className="mt-4 text-sm uppercase tracking-[0.22em] text-[#8ba58a]">{THEME2_CATALOGUE_BANNER.subtitle}</p>
          </div>
        </section>
      </main>

        <Theme2Footer
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
    </Theme2CartToastProvider>
  );
}
