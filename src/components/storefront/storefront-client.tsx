"use client";

import Image from "next/image";

import { useCartStorage } from "@/hooks/useCartStorage";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontNavbar } from "@/components/storefront/storefront-navbar";
import { DynamicStoreFooter } from "@/components/storefront/dynamic-store-footer";
import { isVideoUrl } from "@/utils/media";

type StorefrontClientProps = {
  slug: string;
  store: {
    businessName: string;
    logoText: string;
    about: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    socialLinks: {
      instagram?: string;
      facebook?: string;
      x?: string;
      youtube?: string;
    };
    footerLinks: { label: string; href: string }[];
    theme: {
      layout?: string;
      primary: string;
      accent: string;
      heroImage: string;
      sliderImages: string[];
    };
  };
  products: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    currency: string;
    discountPercentage: number;
  }[];
};

export function StorefrontClient({ slug, store, products }: StorefrontClientProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontNavbar logoText={store.logoText || store.businessName} slug={slug} />

      <section className="relative overflow-hidden" style={{ backgroundColor: `${store.theme.primary}10` }}>
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-10 pt-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-5xl font-black leading-tight text-slate-900">{store.businessName}</h1>
            <p className="mt-4 text-lg text-slate-700">{store.about || "Discover our latest collections."}</p>
          </div>
          {store.theme.heroImage ? (
            isVideoUrl(store.theme.heroImage) ? (
              <video src={store.theme.heroImage} className="h-80 w-full rounded-3xl object-cover" controls autoPlay muted />
            ) : (
              <Image
                src={store.theme.heroImage}
                alt={store.businessName}
                className="h-80 w-full rounded-3xl object-cover"
                width={1200}
                height={900}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )
          ) : (
            <div className="grid h-80 w-full place-items-center rounded-3xl border border-dashed border-slate-300 text-slate-400">No hero media</div>
          )}
        </div>

        {store.theme.sliderImages?.length ? (
          <div className="mx-auto grid w-full max-w-7xl gap-4 px-6 pb-10 md:grid-cols-3">
            {store.theme.sliderImages.slice(0, 3).map((media, index) =>
              isVideoUrl(media) ? (
                <video key={`${slug}-${index}`} src={media} className="h-44 w-full rounded-2xl object-cover" controls muted />
              ) : (
                <Image
                  key={`${slug}-${index}`}
                  src={media}
                  alt={`slide-${index}`}
                  className="h-44 w-full rounded-2xl object-cover"
                  width={1000}
                  height={700}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )
            )}
          </div>
        ) : null}
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-slate-900">Products</h2>
          <a
            href={`/${slug}/products`}
            className="text-sm font-semibold text-slate-700 underline-offset-2 hover:underline"
          >
            View all products
          </a>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product._id} slug={slug} product={product} />
          ))}
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
