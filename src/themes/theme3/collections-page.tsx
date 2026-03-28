"use client";

import Image from "next/image";
import Link from "next/link";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { toCollectionSlug } from "@/themes/theme3/collection-utils";
import type { ThemeHomeProps } from "@/themes/types";
import { isVideoUrl } from "@/utils/media";

type CollectionTile = {
  slug: string;
  label: string;
  count: number;
  cover: string;
};

export function Theme3CollectionsPage({ slug, store, products }: ThemeHomeProps) {
  useCartStorage();

  const collectionMap = new Map<string, CollectionTile>();

  products.forEach((product) => {
    const label = product.category?.trim() || "Uncategorized";
    const categorySlug = toCollectionSlug(label);
    const current = collectionMap.get(categorySlug);

    if (!current) {
      collectionMap.set(categorySlug, {
        slug: categorySlug,
        label,
        count: 1,
        cover: product.images?.[0] || "",
      });
      return;
    }

    current.count += 1;
  });

  const collections = Array.from(collectionMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  const bannerMedia = store.theme.sliderImages?.[0] || "";

  return (
    <div className="min-h-screen bg-[#fae9e6] text-rose-950">
      <div className="mx-auto w-full max-w-3xl rounded-b-[28px] bg-[#cc5639] px-6 py-2 text-center text-sm font-semibold text-white">
        {store.theme.theme3?.announcementText || "Free Shipping On Orders Over $200"}
      </div>

      <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-470 p-2 md:px-4 rounded-t-2xl bg-[#fcf5f4]">
        <section className="relative overflow-hidden rounded-2xl border border-rose-200 bg-[#3f0e07]">
          <div className="relative aspect-1898/420 w-full">
            {bannerMedia ? (
              isVideoUrl(bannerMedia) ? (
                <video
                  src={bannerMedia}
                  className="h-full w-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={bannerMedia}
                  alt="Collections Banner"
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              )
            ) : (
              <div className="grid h-full w-full place-items-center text-rose-200">
                Add slider media in Configure Store
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white md:left-8">
              <h1 className="text-5xl font-semibold leading-tight">All Collections</h1>
              <p className="mt-2 text-sm text-white/90 md:text-xl">
                Curated styles designed for everyday glow.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 w-full py-4 grid grid-cols-2 lg:grid-cols-4 gap-4 ">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/${slug}/collections/${collection.slug}`}
              className="group"
            >
              <div className="overflow-hidden py-2 bg-[#fae9e6] rounded-2xl">
                <div className="relative h-80 w-full overflow-hidden">
                  {collection.cover ? (
                    isVideoUrl(collection.cover) ? (
                      <video
                        src={collection.cover}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={collection.cover}
                        alt={collection.label}
                        fill
                        className="object-contain transition duration-500 group-hover:scale-105"
                        sizes="( max-width: 640px ) 100vw, ( max-width: 1024px ) 50vw, 33vw"
                      />
                    )
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[#3f2019]">
                      No media
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 mx-4 flex items-center justify-between text-sm text-[#3f2019]">
                <span>{collection.label}</span>
                <span className="ml-2 rounded-full bg-[#cc5639] px-2 py-0.5 text-xs font-semibold text-white">
                  {collection.count}
                </span>
              </div>
            </Link>
          ))}
        </section>
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
