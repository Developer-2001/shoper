"use client";

import Image from "next/image";
import Link from "next/link";

import { removeFromCart, updateCartQty } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

export function Theme2CartItems({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items.filter((item) => item.slug === slug));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = items[0]?.currency || "INR";

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-7 text-center text-amber-900">
        Your cart is empty. <Link href={`/${slug}/product`} className="underline">Explore products</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 rounded-3xl border border-amber-200 bg-white p-4">
            {isVideoUrl(item.image) ? (
              <video src={item.image} className="h-24 w-24 rounded-2xl object-cover" muted controls />
            ) : (
              <Image
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-2xl object-cover"
                width={96}
                height={96}
                sizes="96px"
              />
            )}

            <div className="flex-1">
              <p className="font-bold text-amber-950">{item.name}</p>
              <p className="text-amber-800">{formatMoney(item.price, item.currency)}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  className="h-8 w-8 rounded-full border border-amber-300 text-amber-900"
                  onClick={() =>
                    dispatch(
                      updateCartQty({
                        productId: item.productId,
                        slug,
                        quantity: Math.max(1, item.quantity - 1),
                      })
                    )
                  }
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-amber-900">{item.quantity}</span>
                <button
                  className="h-8 w-8 rounded-full border border-amber-300 text-amber-900"
                  onClick={() =>
                    dispatch(
                      updateCartQty({
                        productId: item.productId,
                        slug,
                        quantity: item.quantity + 1,
                      })
                    )
                  }
                >
                  +
                </button>
                <button
                  className="ml-2 text-sm font-semibold text-red-600"
                  onClick={() => dispatch(removeFromCart({ productId: item.productId, slug }))}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-3xl border border-amber-200 bg-white p-5">
        <p className="text-lg font-black uppercase tracking-wide text-amber-900">Order Summary</p>
        <div className="mt-4 flex items-center justify-between text-sm text-amber-800">
          <span>Total</span>
          <span className="text-2xl font-black text-amber-950">{formatMoney(total, currency)}</span>
        </div>
        <Link
          href={`/${slug}/checkout`}
          className="mt-5 block rounded-full bg-amber-500 py-3 text-center text-sm font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-400"
        >
          Continue To Checkout
        </Link>
      </div>
    </div>
  );
}

