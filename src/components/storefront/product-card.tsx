"use client";

import Image from "next/image";
import Link from "next/link";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { formatMoney, salePrice } from "@/utils/currency";

type ProductCardProps = {
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

export function ProductCard({ slug, product }: ProductCardProps) {
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
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/${slug}/product/${product._id}`}>
        <Image
          className="h-52 w-full object-cover"
          src={product.images[0]}
          alt={product.name}
          width={900}
          height={700}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>
      <div className="p-4">
        <Link href={`/${slug}/product/${product._id}`} className="font-semibold text-slate-900">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-lg font-bold text-slate-900">{formatMoney(finalPrice, product.currency)}</p>
          {product.discountPercentage > 0 ? (
            <p className="text-sm text-slate-500 line-through">
              {formatMoney(product.price, product.currency)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 w-full rounded-xl bg-slate-900 py-2 font-semibold text-white"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
