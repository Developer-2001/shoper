"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { useAppDispatch } from "@/hooks/useRedux";
import { addToCart } from "@/store/slices/cartSlice";
import { formatMoney, salePrice } from "@/utils/currency";
import { DynamicStoreFooter } from "@/components/storefront/dynamic-store-footer";
import { HampersNavbar } from "@/themes/hampers/hampers-navbar";
import type { ThemeHomeProps } from "@/themes/types";

const COLLECTIONS = [
  {
    id: "birthday",
    title: "Birthday Hampers",
    subtitle: "Celebrate with warmth",
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "corporate",
    title: "Corporate Gifts",
    subtitle: "Impress your clients",
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "festival",
    title: "Festival Specials",
    subtitle: "Every occasion deserves a hamper",
    image:
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=800&auto=format&fit=crop",
  },
];

type HampersProductCardProps = {
  slug: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    currency: string;
    discountPercentage: number;
  };
};

function HampersProductCard({ slug, product }: HampersProductCardProps) {
  const dispatch = useAppDispatch();
  const finalPrice = salePrice(product.price, product.discountPercentage);

  function addItem() {
    dispatch(
      addToCart({
        slug,
        productId: product._id,
        name: product.name,
        image: product.images[0],
        price: finalPrice,
        currency: product.currency,
        quantity: 1,
      }),
    );
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/${slug}/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <Image
            className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
            src={product.images[0]}
            alt={product.name}
            width={900}
            height={700}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.discountPercentage > 0 ? (
            <span className="absolute left-3 top-3 rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white">
              {product.discountPercentage}% OFF
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-4">
        <Link
          href={`/${slug}/product/${product._id}`}
          className="line-clamp-1 font-semibold text-stone-800 hover:text-amber-700"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-lg font-bold text-amber-800">
            {formatMoney(finalPrice, product.currency)}
          </p>
          {product.discountPercentage > 0 ? (
            <p className="text-sm text-stone-400 line-through">
              {formatMoney(product.price, product.currency)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 w-full cursor-pointer rounded-xl bg-amber-600 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 active:bg-amber-800"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export function HampersHome({ slug, store, products }: ThemeHomeProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-amber-50/30">
      <HampersNavbar logoText={store.logoText || store.businessName} slug={slug} />

      {/* Hero / Banner */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              Thoughtfully Curated
            </p>
            <h1 className="mt-3 text-5xl font-black leading-tight text-stone-900 lg:text-6xl">
              {store.businessName}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              {store.about ||
                "Discover beautifully curated hampers for every occasion — birthdays, festivals, corporate gifting, and more."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/${slug}/products`}
                className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
              >
                Shop Now <ChevronRight size={16} />
              </Link>
              <Link
                href={`/${slug}/products`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-amber-600 px-6 py-3 font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                Explore Collections
              </Link>
            </div>
          </div>

          <div className="relative">
            <Image
              src={store.theme.heroImage}
              alt={store.businessName}
              className="h-80 w-full rounded-3xl object-cover shadow-2xl lg:h-96"
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white px-4 py-3 shadow-lg">
              <p className="text-xs font-semibold text-stone-500">
                Free delivery on
              </p>
              <p className="text-sm font-bold text-amber-700">
                Orders above ₹999
              </p>
            </div>
          </div>
        </div>

        {store.theme.sliderImages?.length ? (
          <div className="mx-auto grid w-full max-w-7xl gap-4 px-6 pb-12 md:grid-cols-3">
            {store.theme.sliderImages.slice(0, 3).map((image, index) => (
              <Image
                key={`${slug}-slide-${index}`}
                src={image}
                alt={`slide-${index}`}
                className="h-44 w-full rounded-2xl object-cover"
                width={1000}
                height={700}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* Featured Products */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Handpicked for You
            </p>
            <h2 className="mt-1 text-3xl font-black text-stone-900">
              Featured Products
            </h2>
          </div>
          <Link
            href={`/${slug}/products`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 underline-offset-2 hover:underline"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <HampersProductCard key={product._id} slug={slug} product={product} />
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-600">
              Browse
            </p>
            <h2 className="mt-1 text-3xl font-black text-stone-900">
              Shop by Collection
            </h2>
            <p className="mt-3 text-stone-500">
              Find the perfect hamper for every occasion
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.id}
                href={`/${slug}/products`}
                className="group relative overflow-hidden rounded-2xl"
              >
                <Image
                  src={collection.image}
                  alt={collection.title}
                  className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
                  width={800}
                  height={600}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white">
                    {collection.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {collection.subtitle}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                    Shop now <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DynamicStoreFooter
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
