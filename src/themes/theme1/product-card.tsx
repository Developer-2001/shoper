"use client";

import Image from "next/image";
import Link from "next/link";
import { Handbag } from "lucide-react";
import { useMemo, useState } from "react";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useTheme1CartToast } from "@/themes/theme1/cart-toast";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import type { StorefrontProduct } from "@/themes/types";

type Theme1ProductCardProps = {
  slug: string;
  product: StorefrontProduct;
  href?: string;
};

export function Theme1ProductCard({
  slug,
  product,
  href,
}: Theme1ProductCardProps) {
  const dispatch = useAppDispatch();
  const { showAddedToCart } = useTheme1CartToast();
  const finalPrice = salePrice(product.price, product.discountPercentage);
  const mediaList = useMemo(
    () => (product.images.length ? product.images.slice(0, 5) : ["/file.svg"]),
    [product.images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia =
    mediaList[activeIndex] || product.images[0] || "/file.svg";
  const firstMedia = product.images[0] || "/file.svg";
  // const discountText = `-${Math.max(product.discountPercentage, 0)}% OFF`;
  const productHref = href || `/${slug}/product/${product._id}`;

  function addItem() {
    dispatch(
      addToCart({
        slug,
        productId: product._id,
        name: product.name,
        image: isVideoUrl(activeMedia) ? firstMedia : activeMedia,
        price: finalPrice,
        currency: product.currency,
        quantity: 1,
      }),
    );
    showAddedToCart(product.name);
  }

  return (
    <article className="overflow-hidden rounded-[22px] bg-white shadow-[0_18px_42px_-36px_rgba(15,23,42,0.38)]">
      <div className="relative overflow-hidden rounded-t-[18px] bg-slate-100">
        {product.discountPercentage > 0 && (
          <span className="absolute left-3 top-3 z-20 rounded-md bg-white px-2 py-1 text-[11px] font-bold tracking-wide text-slate-900 ">
            SALE {Math.max(product.discountPercentage, 0)}% OFF
          </span>
        )}
        <Link
          href={productHref}
          className="relative block aspect-square w-full"
        >
          {isVideoUrl(activeMedia) ? (
            <video
              src={activeMedia}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={activeMedia}
              alt={product.name}
              width={1000}
              height={1000}
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
            />
          )}
        </Link>
        {/* Strip of discount text */}
        {/* <div className="pointer-events-none absolute -bottom-0.5 left-0 right-0 rounded-sm z-20 overflow-hidden  bg-[#1d4ed8] py-2 text-white">
          <div className="Theme1-discount-strip flex w-max items-center whitespace-nowrap font-semibold">
            {Array.from({ length: 2 }).map((_, copyIndex) => (
              <div
                key={copyIndex}
                className="flex shrink-0 items-center gap-6 pr-6"
              >
                {Array.from({ length: 8 }).map((__, index) => (
                  <span key={`${copyIndex}-${index}`} className="text-sm">
                    {discountText}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div> */}
      </div>

      <div className="bg-white px-3 pb-3 pt-2">
        <Link
          href={productHref}
          className="line-clamp-2 text-base font-semibold leading-tight text-slate-900 sm:text-lg"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-lg font-bold leading-none text-slate-900">
            {formatMoney(finalPrice, product.currency)}
          </p>
          {product.discountPercentage > 0 ? (
            <p className="text-sm font-medium text-slate-500 line-through">
              {formatMoney(product.price, product.currency)}
            </p>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mediaList.map((media, index) => (
              <button
                key={`${media}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-xl border transition ${
                  index === activeIndex
                    ? "border-slate-900"
                    : "border-slate-300"
                }`}
                aria-label={`Show product media ${index + 1}`}
              >
                {isVideoUrl(media) ? (
                  <video
                    src={media}
                    className="h-10 w-10 object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={media}
                    alt={`${product.name}-${index + 1}`}
                    width={72}
                    height={72}
                    className="h-10 w-10 object-cover"
                  />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="inline-flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border border-slate-300 bg-transparent text-[#1d4ed8] transition hover:bg-slate-100"
            aria-label={`Add ${product.name} to cart`}
          >
            <Handbag size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .Theme1-discount-strip {
          animation: Theme1-discount-strip 11s linear infinite;
        }

        @keyframes Theme1-discount-strip {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>
    </article>
  );
}
