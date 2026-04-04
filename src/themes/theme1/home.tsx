"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme1ProductCard } from "@/themes/theme1/product-card";
import { Theme1Navbar } from "@/themes/theme1/navbar";
import { Theme1Footer } from "@/themes/theme1/footer";
import type { ThemeHomeProps } from "@/themes/types";

export function Theme1Home({ slug, store, products }: ThemeHomeProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <Theme1Navbar logoText={store.logoText || store.businessName} slug={slug} />

      <section className="relative overflow-hidden" style={{ backgroundColor: "#0f172a10" }}>
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-10 pt-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-5xl font-black leading-tight text-slate-900">{store.businessName}</h1>
            <p className="mt-4 text-lg text-slate-700">{store.about || "Discover our latest collections."}</p>
          </div>
          <Image
            src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
            alt={store.businessName}
            className="h-80 w-full rounded-3xl object-cover"
            width={1200}
            height={900}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-4 px-6 pb-10 md:grid-cols-3">
          <Image
            src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
            alt="slide-1"
            className="h-44 w-full rounded-2xl object-cover"
            width={1000}
            height={700}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Image
            src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
            alt="slide-2"
            className="h-44 w-full rounded-2xl object-cover"
            width={1000}
            height={700}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Image
            src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
            alt="slide-3"
            className="h-44 w-full rounded-2xl object-cover"
            width={1000}
            height={700}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-slate-900">Products</h2>
          <Link href={`/${slug}/product`} className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline">
            View all products
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <Theme1ProductCard key={product._id} slug={slug} product={product} />
          ))}
        </div>
      </section>

      <Theme1Footer
        slug={slug}
        companyName={store.businessName}
        about={store.about}
        address={store.address}
        contactEmail={store.contactEmail}
        contactPhone={store.contactPhone}
        socialLinks={store.socialLinks}
        footerLinks={store.footerLinks || []}
      />
    </div>
  );
}

