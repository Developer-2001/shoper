"use client";

import Image from "next/image";

import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useCartStorage } from "@/hooks/useCartStorage";
import { formatMoney, salePrice } from "@/utils/currency";

type ProductProps = {
  slug: string;
  product: {
    _id: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    currency: string;
    discountPercentage: number;
    inStock: number;
  };
};

export function ProductDetailClient({ slug, product }: ProductProps) {
  const dispatch = useAppDispatch();
  useCartStorage();
  const finalPrice = salePrice(product.price, product.discountPercentage);

  return (
    <article className="grid gap-8 lg:grid-cols-2">
      <Image
        src={product.images[0]}
        alt={product.name}
        className="h-[420px] w-full rounded-3xl object-cover"
        width={1200}
        height={900}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div>
        <h1 className="text-4xl font-black text-slate-900">{product.name}</h1>
        <p className="mt-3 text-slate-600">{product.description || "No description added yet."}</p>
        <p className="mt-5 text-3xl font-bold text-slate-900">{formatMoney(finalPrice, product.currency)}</p>
        {product.discountPercentage > 0 ? (
          <p className="text-slate-500 line-through">{formatMoney(product.price, product.currency)}</p>
        ) : null}
        <p className="mt-2 text-sm text-slate-600">In stock: {product.inStock}</p>

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
          className="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white cursor-pointer transition hover:bg-slate-800 active:bg-slate-900"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
