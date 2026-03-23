"use client";

import Image from "next/image";
import Link from "next/link";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useCartStorage } from "@/hooks/useCartStorage";
import { formatMoney, salePrice } from "@/utils/currency";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme2ProductDetail({ slug, product }: ThemeProductDetailProps) {
  const dispatch = useAppDispatch();
  useCartStorage();

  const finalPrice = salePrice(product.price, product.discountPercentage);

  return (
    <article className="grid gap-8 rounded-3xl border border-amber-200 bg-white p-6 shadow-[0_30px_60px_-50px_rgba(120,53,15,0.8)] lg:grid-cols-[1.05fr_1fr] lg:p-10">
      <div>
        <Image
          src={product.images[0]}
          alt={product.name}
          className="h-[440px] w-full rounded-2xl object-cover"
          width={1200}
          height={900}
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Product Details</p>
        <h1 className="mt-2 text-4xl font-black text-amber-950">{product.name}</h1>
        <p className="mt-4 text-amber-800">{product.description || "No description added yet."}</p>

        <p className="mt-6 text-4xl font-black text-amber-900">{formatMoney(finalPrice, product.currency)}</p>
        {product.discountPercentage > 0 ? (
          <p className="mt-1 text-sm text-amber-700 line-through">{formatMoney(product.price, product.currency)}</p>
        ) : null}

        <p className="mt-3 text-sm text-amber-800">In stock: {product.inStock ?? 0}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
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
              )
            }
            className="rounded-full bg-amber-500 px-8 py-3 text-sm font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-400"
          >
            Add To Cart
          </button>
          <Link
            href={`/${slug}/cart`}
            className="rounded-full border border-amber-300 px-8 py-3 text-sm font-bold uppercase tracking-wide text-amber-900 transition hover:border-amber-500 hover:bg-amber-100"
          >
            View Cart
          </Link>
        </div>
      </div>
    </article>
  );
}
