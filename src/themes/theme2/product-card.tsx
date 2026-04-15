"use client";

import Image from "next/image";
import Link from "next/link";

import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { StorefrontProduct } from "@/themes/types";

type Theme2ProductCardProps = {
  slug: string;
  product: StorefrontProduct;
};

export function Theme2ProductCard({ slug, product }: Theme2ProductCardProps) {
  const productPrice = Number(product.price) || 0;
  const discountPercentage = Math.max(
    0,
    Number(product.discountPercentage) || 0,
  );
  const finalPrice = salePrice(productPrice, discountPercentage);
  const showDiscountPrice = discountPercentage > 0 && finalPrice < productPrice;
  const firstMedia = product.images[0] || "/file.svg";

  return (
    <article className="group bg-transparent [font-family:var(--font-theme2-sans)]">
      <Link href={`/${slug}/product/${product._id}`} className="block overflow-hidden border border-[#d5dbd8] bg-white">
        {isVideoUrl(firstMedia) ? (
          <video src={firstMedia} className="h-58 w-full object-cover" muted playsInline controls preload="metadata" />
        ) : (
          <Image
            className="h-58 w-full object-cover transition duration-500 group-hover:scale-105"
            src={firstMedia}
            alt={product.name}
            width={900}
            height={700}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
      </Link>

      <div className="pt-3">
        <Link
          href={`/${slug}/product/${product._id}`}
          className="line-clamp-2 text-xl uppercase tracking-[0.06em] text-[#2b3e3a] [font-family:var(--font-theme2-serif)]"
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center gap-2 text-[#2f3f3c]">
          <p className="text-sm font-semibold">{formatMoney(finalPrice, product.currency)}</p>
          {showDiscountPrice ? (
            <p className="text-xs text-[#6f817d] line-through">{formatMoney(productPrice, product.currency)}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
