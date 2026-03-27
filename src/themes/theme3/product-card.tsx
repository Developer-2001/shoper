"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { StorefrontProduct } from "@/themes/types";
import { toCollectionSlug } from "@/themes/theme3/collection-utils";

type Theme3ProductCardProps = {
  slug: string;
  product: StorefrontProduct;
  href?: string;
};

export function Theme3ProductCard({ slug, product, href }: Theme3ProductCardProps) {
  const dispatch = useAppDispatch();
  const finalPrice = salePrice(product.price, product.discountPercentage);
  const firstMedia = product.images[0] || "/file.svg";
  const productHref =
    href ||
    `/${slug}/collections/${toCollectionSlug(product.category || "uncategorized")}/${product._id}`;

  function addItem() {
    dispatch(
      addToCart({
        slug,
        productId: product._id,
        name: product.name,
        image: firstMedia,
        price: finalPrice,
        currency: product.currency,
        quantity: 1,
      }),
    );
  }

  return (
    <article className="overflow-hidden rounded-t-3xl shadow-[0_20px_50px_-35px_rgba(163,72,95,0.5)]">
      <Link href={productHref} className="block pb-2">
        <div className="relative overflow-hidden rounded-t-2xl bg-[#f9e9ed]">
          {product.discountPercentage > 0 ? (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#cc5639] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              -{product.discountPercentage}% OFF
            </span>
          ) : null}
          {isVideoUrl(firstMedia) ? (
            <video src={firstMedia} className="h-64 w-full object-cover" muted controls />
          ) : (
            <Image
              src={firstMedia}
              alt={product.name}
              width={1000}
              height={900}
              className="h-64 w-full object-contain transition duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            />
          )}
        </div>
      </Link>

      <div className="px-5 pb-5">
        <Link href={productHref} className="line-clamp-2 text-lg font-semibold text-rose-950">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-lg font-bold text-rose-950">{formatMoney(finalPrice, product.currency)}</p>
          {product.discountPercentage > 0 ? (
            <p className="text-sm text-rose-700/70 line-through">{formatMoney(product.price, product.currency)}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
        >
          <ShoppingBag size={16} />
          Add To Cart
        </button>
      </div>
    </article>
  );
}
