"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { Theme2CartToastProvider } from "@/themes/theme2/cart-toast";
import { toCollectionSlug } from "@/themes/theme2/collection-utils";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2ProductDetail } from "@/themes/theme2/product-detail";
import type { ThemeProductDetailProps } from "@/themes/types";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

function hashString(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pseudoShuffleBySeed<
  T extends {
    _id: string;
  },
>(items: T[], seed: string) {
  return [...items].sort((a, b) => {
    const aHash = hashString(`${seed}:${a._id}`);
    const bHash = hashString(`${seed}:${b._id}`);
    return aHash - bHash;
  });
}

export function Theme2ProductDetailPage({
  slug,
  store,
  product,
  products = [],
}: ThemeProductDetailProps) {
  const relatedProducts = useMemo(() => {
    const availableProducts = products.filter(
      (item) => item._id !== product._id,
    );
    if (!availableProducts.length) {
      return [];
    }

    const currentCategory = toCollectionSlug(
      product.category || "uncategorized",
    );

    const sameCategoryProducts = availableProducts.filter(
      (item) =>
        toCollectionSlug(item.category || "uncategorized") === currentCategory,
    );
    const otherCategoryProducts = availableProducts.filter(
      (item) =>
        toCollectionSlug(item.category || "uncategorized") !== currentCategory,
    );

    return [
      ...pseudoShuffleBySeed(sameCategoryProducts, `${product._id}:same`),
      ...pseudoShuffleBySeed(otherCategoryProducts, `${product._id}:other`),
    ].slice(0, 10);
  }, [products, product._id, product.category]);

  return (
    <Theme2CartToastProvider>
      <div className="min-h-screen bg-[#f4f4f1] text-[#233532]">
        <Theme2Navbar slug={slug} logoText={store.logoText || "PRESENT DAY"} />

        <main className="mx-auto w-full max-w-7xl px-4 py-8">
          <Theme2ProductDetail slug={slug} store={store} product={product} />

          {relatedProducts.length ? (
            <section className="mt-12 border-t border-[#c4cbc8] pt-8">
              <h2 className="text-3xl uppercase tracking-[0.08em] text-[#2c3d39] [font-family:var(--font-theme2-serif)] sm:text-4xl">
                You might also like
              </h2>

              <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth">
                {relatedProducts.map((item) => {
                  const finalPrice = salePrice(
                    item.price,
                    item.discountPercentage,
                  );
                  const primaryMedia = item.images[0] || "/file.svg";

                  return (
                    <article
                      key={item._id}
                      className="min-w-[200px] snap-start overflow-hidden border border-[#cfd6d3] bg-white sm:min-w-[240px]"
                    >
                      <div className="relative overflow-hidden">
                        {item.discountPercentage > 0 ? (
                          <span className="absolute left-2 top-2 z-10 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2d413d]">
                            Sale {Math.max(item.discountPercentage, 0)}% Off
                          </span>
                        ) : null}

                        <Link href={`/${slug}/product/${item._id}`} className="block">
                          <div className="relative aspect-square w-full bg-[#eef2ef]">
                            {isVideoUrl(primaryMedia) ? (
                              <video
                                src={primaryMedia}
                                className="h-full w-full object-cover"
                                muted
                                autoPlay
                                loop
                                playsInline
                                preload="metadata"
                              />
                            ) : (
                              <Image
                                src={primaryMedia}
                                alt={item.name}
                                width={1000}
                                height={1000}
                                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                                sizes="(max-width: 640px) 50vw, 240px"
                              />
                            )}
                          </div>
                        </Link>
                      </div>

                      <div className="p-3">
                        <Link
                          href={`/${slug}/product/${item._id}`}
                          className="line-clamp-2 text-base uppercase tracking-[0.04em] text-[#2b3e3a] [font-family:var(--font-theme2-serif)]"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#2f3f3c]">
                            {formatMoney(finalPrice, item.currency)}
                          </p>
                          {item.discountPercentage > 0 ? (
                            <p className="text-xs text-[#6f817d] line-through">
                              {formatMoney(item.price, item.currency)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
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
