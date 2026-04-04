"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { Theme1Navbar } from "@/themes/theme1/navbar";
import { Theme1Footer } from "@/themes/theme1/footer";
import { Theme1CartToastProvider } from "@/themes/theme1/cart-toast";
import { Theme1ProductDetail } from "@/themes/theme1/product-detail";
import { toCollectionSlug } from "@/themes/theme1/collection-utils";
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

export function Theme1ProductDetailPage({
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
    <Theme1CartToastProvider>
      <div className="min-h-screen font-['Helvetica'] bg-slate-100 text-slate-900">
        <Theme1Navbar
          slug={slug}
          logoText={store.logoText || store.businessName}
        />

        <main className="mx-auto w-full max-w-470 rounded-t-2xl bg-white px-3 py-4 sm:px-4">
          <Theme1ProductDetail slug={slug} store={store} product={product} />

          {relatedProducts.length ? (
            <section className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                You might also like
              </h2>

              <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scroll-smooth">
                {relatedProducts.map((item) => {
                  const finalPrice = salePrice(
                    item.price,
                    item.discountPercentage,
                  );
                  const primaryMedia = item.images[0] || "/file.svg";

                  return (
                    <article
                      key={item._id}
                      className="min-w-[180px] snap-start overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:min-w-[220px]"
                    >
                      <div className="relative overflow-hidden ">
                        {product.discountPercentage > 0 && (
                          <span className="absolute left-1 top-1 z-20 rounded-md bg-white px-2 py-1 text-[11px] font-bold tracking-wide text-slate-900 ">
                            SALE {Math.max(product.discountPercentage, 0)}% OFF
                          </span>
                        )}
                        <Link
                          href={`/${slug}/product/${item._id}`}
                          className="block"
                        >
                          <div className="relative aspect-square w-full bg-slate-100">
                            {isVideoUrl(primaryMedia) ? (
                              <video
                                src={primaryMedia}
                                className="h-full w-full object-cover"
                                muted
                                autoPlay
                                loop
                                playsInline
                              />
                            ) : (
                              <Image
                                src={primaryMedia}
                                alt={item.name}
                                width={1000}
                                height={1000}
                                className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                                sizes="(max-width: 640px) 46vw, 220px"
                              />
                            )}
                          </div>
                        </Link>
                      </div>

                      <div className="p-3">
                        <Link
                          href={`/${slug}/product/${item._id}`}
                          className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-base font-bold text-slate-900">
                            {formatMoney(finalPrice, item.currency)}
                          </p>
                          {item.discountPercentage > 0 ? (
                            <p className="text-xs text-slate-500 line-through">
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

        <Theme1Footer
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
    </Theme1CartToastProvider>
  );
}
