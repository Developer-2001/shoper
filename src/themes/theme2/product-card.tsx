"use client";

import Image from "next/image";
import Link from "next/link";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { formatMoney, salePrice } from "@/utils/currency";
import type { StorefrontProduct } from "@/themes/types";

type Theme2ProductCardProps = {
  slug: string;
  product: StorefrontProduct;
};

export function Theme2ProductCard({ slug, product }: Theme2ProductCardProps) {
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
      })
    );
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-[0_16px_40px_-30px_rgba(146,64,14,0.6)]">
      <Link href={`/${slug}/product/${product._id}`}>
        <Image
          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
          src={product.images[0]}
          alt={product.name}
          width={900}
          height={700}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <div className="space-y-3 p-5">
        <Link href={`/${slug}/product/${product._id}`} className="line-clamp-2 text-lg font-bold text-amber-950">
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          <p className="text-xl font-black text-amber-900">{formatMoney(finalPrice, product.currency)}</p>
          {product.discountPercentage > 0 ? (
            <p className="text-sm text-amber-700/70 line-through">{formatMoney(product.price, product.currency)}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="w-full rounded-full bg-amber-500 py-2.5 text-sm font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-400"
        >
          Add To Cart
        </button>
      </div>
    </article>
  );
}
