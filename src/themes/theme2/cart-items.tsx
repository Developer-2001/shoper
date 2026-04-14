"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, CircleX, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { removeFromCart, updateCartQty } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import { THEME2_ADDRESS_OPTIONS, THEME2_FOOTER_NOTE } from "@/themes/theme2/theme2-config";

type Theme2CheckoutMeta = {
  cardMessage: string;
  toName: string;
  addressType: (typeof THEME2_ADDRESS_OPTIONS)[number]["value"];
  fromName: string;
  specialInstructions: string;
  deliveryDate: string;
};

const DEFAULT_CHECKOUT_META: Theme2CheckoutMeta = {
  cardMessage: "",
  toName: "",
  addressType: "residential",
  fromName: "",
  specialInstructions: "",
  deliveryDate: "Mon, April 20, 2026",
};

export function Theme2CartItems({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items.filter((item) => item.slug === slug));

  const [checkoutMeta, setCheckoutMeta] = useState<Theme2CheckoutMeta>(DEFAULT_CHECKOUT_META);

  const currency = items[0]?.currency || "INR";
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const subtotalLabel = formatMoney(total, currency);

  const checkoutMetaKey = `theme2CheckoutMeta:${slug}`;

  useEffect(() => {
    const rawValue = localStorage.getItem(checkoutMetaKey);
    if (!rawValue) return;

    try {
      const parsed = JSON.parse(rawValue) as Partial<Theme2CheckoutMeta>;
      setCheckoutMeta((prev) => ({
        ...prev,
        ...parsed,
      }));
    } catch {
      localStorage.removeItem(checkoutMetaKey);
    }
  }, [checkoutMetaKey]);

  useEffect(() => {
    localStorage.setItem(checkoutMetaKey, JSON.stringify(checkoutMeta));
  }, [checkoutMeta, checkoutMetaKey]);

  function setCheckoutMetaField<Key extends keyof Theme2CheckoutMeta>(key: Key, value: Theme2CheckoutMeta[Key]) {
    setCheckoutMeta((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  if (!items.length) {
    return (
      <div className="border border-dashed border-[#b8c0bd] bg-[#f9faf8] p-10 text-center text-[#364a45]">
        <p className="text-3xl [font-family:var(--font-theme2-serif)]">Your cart is empty.</p>
        <Link href={`/${slug}/product`} className="mt-4 inline-flex border border-[#8fa29d] px-5 py-2 text-sm uppercase tracking-[0.12em]">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 [font-family:var(--font-theme2-sans)]">
      <div className="overflow-hidden border border-[#adb7b4] bg-white">
        <table className="w-full border-collapse text-left text-sm text-[#304340]">
          <thead className="bg-[#f2f4f1] text-xs uppercase tracking-[0.14em] text-[#425652]">
            <tr>
              <th className="border-b border-[#c7cfcc] px-4 py-3">Product</th>
              <th className="border-b border-[#c7cfcc] px-4 py-3">Price</th>
              <th className="border-b border-[#c7cfcc] px-4 py-3">Quantity</th>
              <th className="border-b border-[#c7cfcc] px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId} className="border-b border-[#d3dad7] align-top last:border-b-0">
                <td className="px-4 py-5">
                  <div className="flex gap-3">
                    <div className="h-24 w-24 overflow-hidden border border-[#d4dcda] bg-[#f7f8f6]">
                      {isVideoUrl(item.image) ? (
                        <video src={item.image} className="h-full w-full object-cover" muted controls playsInline preload="metadata" />
                      ) : (
                        <Image src={item.image} alt={item.name} width={100} height={100} className="h-full w-full object-cover" sizes="96px" />
                      )}
                    </div>
                    <div>
                      <p className="text-xl uppercase text-[#3f5852] [font-family:var(--font-theme2-serif)]">{item.name}</p>
                      <p className="mt-1 text-sm text-[#667975]">Gift hamper item</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5">{formatMoney(item.price, item.currency)}</td>
                <td className="px-4 py-5">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => {
                      const quantity = Math.max(1, Number(event.target.value) || 1);
                      dispatch(updateCartQty({ slug, productId: item.productId, quantity }));
                    }}
                    className="h-10 w-18 border border-[#a8b4b0] px-2 text-center text-sm"
                  />
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center justify-between gap-2">
                    <span>{formatMoney(item.price * item.quantity, item.currency)}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart({ slug, productId: item.productId }))}
                      className="inline-flex h-7 w-7 items-center justify-center text-[#7a8b87] transition hover:text-[#304340]"
                      aria-label={`Remove ${item.name}`}
                    >
                      <CircleX size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_290px]">
        <section className="space-y-4 text-[#2f403d]">
          <label className="block text-sm uppercase tracking-[0.14em]">
            Message for Greeting Card - Enter Your Custom Message Below:
            <textarea
              value={checkoutMeta.cardMessage}
              onChange={(event) => setCheckoutMetaField("cardMessage", event.target.value.slice(0, 150))}
              className="mt-2 min-h-34 w-full border border-[#aeb9b5] bg-white p-3 text-sm"
              placeholder="Up to 150 characters"
            />
          </label>

          <label className="block text-sm uppercase tracking-[0.14em]">
            To (Full Name):
            <input
              value={checkoutMeta.toName}
              onChange={(event) => setCheckoutMetaField("toName", event.target.value)}
              className="mt-2 h-10 w-full border border-[#aeb9b5] bg-white px-3 text-sm"
            />
          </label>

          <fieldset className="space-y-2 text-sm">
            {THEME2_ADDRESS_OPTIONS.map((option) => (
              <label key={option.value} className="inline-flex items-center gap-2 pr-4">
                <input
                  type="radio"
                  checked={checkoutMeta.addressType === option.value}
                  onChange={() => setCheckoutMetaField("addressType", option.value)}
                  className="accent-[#395f58]"
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <label className="block text-sm uppercase tracking-[0.14em]">
            From:
            <input
              value={checkoutMeta.fromName}
              onChange={(event) => setCheckoutMetaField("fromName", event.target.value)}
              className="mt-2 h-10 w-full border border-[#aeb9b5] bg-white px-3 text-sm"
            />
          </label>

          <label className="block text-sm uppercase tracking-[0.14em]">
            Special Instructions:
            <textarea
              value={checkoutMeta.specialInstructions}
              onChange={(event) => setCheckoutMetaField("specialInstructions", event.target.value)}
              className="mt-2 min-h-34 w-full border border-[#aeb9b5] bg-white p-3 text-sm"
            />
          </label>
        </section>

        <aside className="h-fit border border-[#cad1ce] bg-[#f7f9f7] p-4 text-[#2f403d] lg:sticky lg:top-6">
          <p className="text-4xl leading-none [font-family:var(--font-theme2-serif)]">{subtotalLabel}</p>
          <p className="mt-2 text-sm">
            or 4 payments of <span className="font-semibold">{formatMoney(total / 4, currency)}</span> with sezzle
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="flex min-h-24 flex-col items-center justify-center border border-[#bcc5c2] bg-white p-2 text-center text-xs uppercase tracking-[0.1em]">
              <Truck size={18} className="mb-2" />
              Shipping Canada
            </div>
            <div className="flex min-h-24 flex-col items-center justify-center border border-[#bcc5c2] bg-white p-2 text-center text-xs uppercase tracking-[0.1em]">
              <Truck size={18} className="mb-2" />
              Toronto Delivery (11am to 8pm)
            </div>
          </div>

          <p className="mt-3 text-xs text-[#5f726e]">(USA shipping currently paused) Please select a delivery date, then click the checkout button.</p>

          <button
            type="button"
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 border border-[#b6c0bc] bg-white text-sm"
          >
            <Calendar size={14} />
            {checkoutMeta.deliveryDate}
          </button>

          <Link
            href={`/${slug}/checkout`}
            className="mt-4 block h-11 bg-[#95af8f] py-3 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#809c7c]"
          >
            Check Out
          </Link>
          <button type="button" className="mt-3 h-11 w-full bg-[#5d3f81] text-sm font-semibold text-white">
            Checkout with sezzle
          </button>
        </aside>
      </div>

      <div className="border border-[#b5bfbb] bg-[#f7f9f7] px-4 py-5 text-sm text-[#445955]">{THEME2_FOOTER_NOTE}</div>
    </div>
  );
}
