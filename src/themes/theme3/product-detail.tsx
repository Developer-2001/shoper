"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useCartStorage } from "@/hooks/useCartStorage";
import { useTheme3CartToast } from "@/themes/theme3/cart-toast";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { ThemeProductDetailProps } from "@/themes/types";

export function Theme3ProductDetail({ slug, product }: ThemeProductDetailProps) {
  const dispatch = useAppDispatch();
  const { showAddedToCart } = useTheme3CartToast();
  useCartStorage();

  const mediaList = useMemo(() => product.images.slice(0, 6), [product.images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = mediaList[activeIndex] || product.images[0] || "/file.svg";

  const finalPrice = salePrice(product.price, product.discountPercentage);

  function handleAddToCart() {
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
    );

    showAddedToCart(product.name);
  }

  return (
    <article className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:p-8">
      <div>
        <div className="overflow-hidden rounded-2xl border border-[#fae9e6] bg-[#fae9e6]">
          {isVideoUrl(activeMedia) ? (
            <video
              src={activeMedia}
              className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[520px]"
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={activeMedia}
              alt={product.name}
              width={1200}
              height={900}
              className="h-[300px] w-full object-contain sm:h-[420px] lg:h-[520px]"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          )}
        </div>

        {mediaList.length > 1 ? (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
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
                  <video
                    src={media}
                    className="h-16 w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
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
        <h1 className="mt-3 text-2xl font-semibold text-rose-950 sm:text-3xl md:text-4xl">{product.name}</h1>
        <p className="mt-3 text-rose-900/80">{product.description || "No description added yet."}</p>
        <p className="mt-6 text-2xl font-bold text-rose-950 sm:text-3xl md:text-4xl">{formatMoney(finalPrice, product.currency)}</p>
        {product.discountPercentage > 0 ? (
          <p className="mt-1 text-sm text-rose-700 line-through">{formatMoney(product.price, product.currency)}</p>
        ) : null}
        <p className="mt-2 text-sm text-rose-800">In stock: {product.inStock ?? 0}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-full bg-[#cc5639] px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#b84c32] sm:w-auto"
          >
            Add To Cart
          </button>
          <Link href={`/${slug}/cart`} className="w-full rounded-full border border-rose-300 px-7 py-3 text-center text-sm font-semibold text-rose-900 transition hover:bg-rose-100 sm:w-auto">
            View Cart
          </Link>
        </div>
      </div>
    </article>
  );
}
