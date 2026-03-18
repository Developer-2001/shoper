"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromCart, updateQuantity } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.storeSlug === slug),
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
      <p className="mt-2 text-sm text-slate-600">Store: /{slug}</p>

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-slate-600">Your cart is empty.</p>
            <Link href={`/${slug}/products`} className="mt-3 inline-block text-sm font-semibold text-slate-900">
              Continue shopping
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.productId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{formatCurrency(item.price, item.currency)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      dispatch(
                        updateQuantity({
                          storeSlug: slug,
                          productId: item.productId,
                          quantity: Number(event.target.value),
                        }),
                      )
                    }
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1"
                  />
                </div>
              </div>
              <Button
                variant="danger"
                onClick={() => dispatch(removeFromCart({ storeSlug: slug, productId: item.productId }))}
              >
                Remove
              </Button>
            </article>
          ))
        )}
      </div>

      {items.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(total, items[0].currency)}</p>
          </div>
          <Button className="mt-4 w-full" onClick={() => router.push(`/${slug}/checkout`)}>
            Proceed to Checkout
          </Button>
        </div>
      ) : null}
    </main>
  );
}
