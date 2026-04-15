"use client";

import Image from "next/image";
import Link from "next/link";
import { Handbag } from "lucide-react";

import { useAppDispatch } from "@/hooks/useRedux";
import { addToCart } from "@/store/slices/cartSlice";
import {
  toAnalyticsItem,
  trackStorefrontEvent,
} from "@/lib/storefront-analytics/client";
import { useTheme2CartToast } from "@/themes/theme2/cart-toast";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { StorefrontProduct } from "@/themes/types";

type Theme2ProductCardProps = {
  slug: string;
  product: StorefrontProduct;
};

export function Theme2ProductCard({ slug, product }: Theme2ProductCardProps) {
  const dispatch = useAppDispatch();
  const { showAddedToCart } = useTheme2CartToast();
  const productPrice = Number(product.price) || 0;
  const discountPercentage = Math.max(
    0,
    Number(product.discountPercentage) || 0,
  );
  const finalPrice = salePrice(productPrice, discountPercentage);
  const showDiscountPrice = discountPercentage > 0 && finalPrice < productPrice;
  const firstMedia = product.images[0] || "/file.svg";

  function addItem() {
    const analyticsItem = toAnalyticsItem({
      productId: product._id,
      name: product.name,
      category: product.category,
      price: finalPrice,
      quantity: 1,
    });

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

    trackStorefrontEvent({
      event: "add_to_cart",
      slug,
      storeTheme: "theme2",
      ecommerce: {
        currency: product.currency,
        value: finalPrice,
        items: [analyticsItem],
      },
    });

    showAddedToCart(product.name);
  }

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

        <div className="mt-2 flex items-center justify-between gap-2 text-[#2f3f3c]">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{formatMoney(finalPrice, product.currency)}</p>
            {showDiscountPrice ? (
              <p className="text-xs text-[#6f817d] line-through">{formatMoney(productPrice, product.currency)}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex h-9 w-9 items-center justify-center border border-[#c7cfcc] bg-white text-[#2f403d] transition hover:bg-[#eef2ef]"
            aria-label={`Add ${product.name} to cart`}
          >
            <Handbag size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
