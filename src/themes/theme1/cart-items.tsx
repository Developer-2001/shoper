"use client";

import Image from "next/image";

import { removeFromCart, updateCartQty } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

type Theme1CartItemsProps = {
  slug: string;
};

export function Theme1CartItems({ slug }: Theme1CartItemsProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items.filter((item) => item.slug === slug));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = items[0]?.currency || "INR";

  if (!items.length) {
    return <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-600">Your cart is empty.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            {isVideoUrl(item.image) ? (
              <video src={item.image} className="h-20 w-20 rounded-xl object-cover" muted controls />
            ) : (
              <Image
                src={item.image}
                alt={item.name}
                className="h-20 w-20 rounded-xl object-cover"
                width={80}
                height={80}
                sizes="80px"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-slate-600">{formatMoney(item.price, item.currency)}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  className="h-8 w-8 rounded border border-slate-300"
                  onClick={() =>
                    dispatch(
                      updateCartQty({
                        productId: item.productId,
                        slug,
                        quantity: Math.max(1, item.quantity - 1),
                      }),
                    )
                  }
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  className="h-8 w-8 rounded border border-slate-300"
                  onClick={() =>
                    dispatch(
                      updateCartQty({
                        productId: item.productId,
                        slug,
                        quantity: item.quantity + 1,
                      }),
                    )
                  }
                >
                  +
                </button>
                <button
                  className="ml-3 text-sm text-red-600"
                  onClick={() => dispatch(removeFromCart({ productId: item.productId, slug }))}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-lg font-bold text-slate-900">Order Summary</p>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Total</span>
          <span className="text-lg font-bold text-slate-900">{formatMoney(total, currency)}</span>
        </div>
        <a href={`/${slug}/checkout`} className="mt-5 block rounded-xl bg-slate-900 py-3 text-center font-semibold text-white">
          Checkout
        </a>
      </div>
    </div>
  );
}
