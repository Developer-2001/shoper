"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2ProductCard } from "@/themes/theme2/product-card";
import type { ThemeHomeProps } from "@/themes/types";

export function Theme2Home({ slug, store, products }: ThemeHomeProps) {
  useCartStorage();

  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff3d6_0%,#fff8e7_40%,#fff_100%)] text-amber-950">
      <Theme2Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-10 pt-10 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">{store.businessName}</p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-tight text-amber-950 md:text-6xl">
            Build Your Signature Shopping Experience
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-amber-900">
            {store.about || "Premium picks, reliable delivery, and standout value in every product."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/${slug}/products`}
              className="rounded-full bg-amber-500 px-7 py-3 text-sm font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-400"
            >
              Shop All Products
            </Link>
            <Link
              href={`/${slug}/cart`}
              className="rounded-full border border-amber-300 bg-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-amber-900 transition hover:border-amber-500"
            >
              Go To Cart
            </Link>
          </div>
        </div>

        <Image
          src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
          alt={store.businessName}
          width={1200}
          height={900}
          className="h-105 w-full rounded-4xl  border border-amber-200 object-cover shadow-[0_40px_80px_-60px_rgba(146,64,14,0.9)]"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-6">
        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
          <Image
            src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
            alt="showcase-1"
            width={1100}
            height={760}
            className="h-52 w-[85%] min-w-[85%] snap-start rounded-3xl border border-amber-200 object-cover md:h-64 md:w-[48%] md:min-w-[48%]"
            sizes="(max-width: 768px) 85vw, 48vw"
          />
          <Image
            src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
            alt="showcase-2"
            width={1100}
            height={760}
            className="h-52 w-[85%] min-w-[85%] snap-start rounded-3xl border border-amber-200 object-cover md:h-64 md:w-[48%] md:min-w-[48%]"
            sizes="(max-width: 768px) 85vw, 48vw"
          />
          <Image
            src="https://storage.googleapis.com/canada-ecommerce-assets/ranka/theme3-collection-labels/a-1774629332806.avif"
            alt="showcase-3"
            width={1100}
            height={760}
            className="h-52 w-[85%] min-w-[85%] snap-start rounded-3xl border border-amber-200 object-cover md:h-64 md:w-[48%] md:min-w-[48%]"
            sizes="(max-width: 768px) 85vw, 48vw"
          />
        </div>
      </section>

      <section className="mx-auto mt-12 w-full max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Company Branding</p>
            <h2 className="mt-2 text-3xl font-black uppercase text-amber-950">Featured Products</h2>
          </div>
          <Link href={`/${slug}/products`} className="text-sm font-bold uppercase tracking-wide text-amber-800 underline">
            View all
          </Link>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <Theme2ProductCard key={product._id} slug={slug} product={product} />
          ))}
        </div>
      </section>

      <Theme2Footer
        slug={slug}
        companyName={store.businessName}
        about={store.about}
        address={store.address}
        contactEmail={store.contactEmail}
        contactPhone={store.contactPhone}
        footerLinks={store.footerLinks || []}
      />
    </div>
  );
}
