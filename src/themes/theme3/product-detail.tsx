"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useCartStorage } from "@/hooks/useCartStorage";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme3ProductDetail({ slug, product }: ThemeProductDetailProps) {
  const dispatch = useAppDispatch();
  useCartStorage();

  const mediaList = useMemo(() => product.images.slice(0, 6), [product.images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = mediaList[activeIndex] || product.images[0] || "/file.svg";

  const finalPrice = salePrice(product.price, product.discountPercentage);

  return (
    <article className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:p-8">
      <div>
        <div className="overflow-hidden rounded-2xl border border-rose-200 bg-[#fbecef]">
          {isVideoUrl(activeMedia) ? (
            <video src={activeMedia} className="h-125 w-full object-cover" controls autoPlay muted />
          ) : (
            <Image
              src={activeMedia}
              alt={product.name}
              width={1200}
              height={900}
              className="h-125 w-full object-contain"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          )}
        </div>

        {mediaList.length > 1 ? (
          <div className="mt-3 grid grid-cols-6 gap-2">
            {mediaList.map((media, index) => (
              <button
                key={`${media}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-xl border ${
                  index === activeIndex ? "border-rose-500 ring-2 ring-rose-100" : "border-rose-200"
                }`}
              >
                {isVideoUrl(media) ? (
                  <video src={media} className="h-16 w-full object-cover" muted />
                ) : (
                  <Image src={media} alt={`${product.name}-${index + 1}`} width={160} height={120} className="h-16 w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <p className="rounded-full bg-[#cc5639] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white inline-block">Jewellery</p>
        <h1 className="mt-3 text-4xl font-semibold text-rose-950">{product.name}</h1>
        <p className="mt-3 text-rose-900/80">{product.description || "No description added yet."}</p>
        <p className="mt-6 text-4xl font-bold text-rose-950">{formatMoney(finalPrice, product.currency)}</p>
        {product.discountPercentage > 0 ? (
          <p className="mt-1 text-sm text-rose-700 line-through">{formatMoney(product.price, product.currency)}</p>
        ) : null}
        <p className="mt-2 text-sm text-rose-800">In stock: {product.inStock ?? 0}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              dispatch(
                addToCart({
                  slug,
                  productId: product._id,
                  name: product.name,
                  image: product.images[0] || "/file.svg",
                  price: finalPrice,
                  currency: product.currency,
                  quantity: 1,
                }),
              )
            }
            className="rounded-full bg-[#cc5639] px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#b84c32]"
          >
            Add To Cart
          </button>
          <Link href={`/${slug}/cart`} className="rounded-full border border-rose-300 px-7 py-3 text-sm font-semibold text-rose-900 transition hover:bg-rose-100">
            View Cart
          </Link>
        </div>
      </div>
    </article>
  );
}
