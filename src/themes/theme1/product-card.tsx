"use client";

import Image from "next/image";
import Link from "next/link";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { formatMoney, salePrice } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

type Theme1ProductCardProps = {
  slug: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    currency: string;
    discountPercentage: number;
  };
};

export function Theme1ProductCard({ slug, product }: Theme1ProductCardProps) {
  const dispatch = useAppDispatch();
  const finalPrice = salePrice(product.price, product.discountPercentage);
  const firstMedia = product.images[0] || "/file.svg";

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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/${slug}/product/${product._id}`}>
        {isVideoUrl(firstMedia) ? (
          <video className="h-52 w-full object-cover" src={firstMedia} autoPlay muted loop playsInline />
        ) : (
          <Image
            className="h-52 w-full object-contain"
            src={firstMedia}
            alt={product.name}
            width={900}
            height={700}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
      </Link>
      <div className="border-t border-slate-200 px-4 py-2">
        <Link href={`/${slug}/product/${product._id}`} className="font-semibold text-slate-900">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-lg font-bold text-slate-900">{formatMoney(finalPrice, product.currency)}</p>
          {product.discountPercentage > 0 ? (
            <p className="text-sm text-slate-500 line-through">{formatMoney(product.price, product.currency)}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 w-full cursor-pointer rounded-xl bg-slate-900 py-2 font-semibold text-white transition hover:bg-slate-800 active:bg-slate-900"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
