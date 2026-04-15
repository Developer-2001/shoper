"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleX, PlusIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { removeFromCart, updateCartQty } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

const CART_DISCOUNT_CODES: Record<string, { code: string; percent: number }> = {
  deva123: { code: "Deva123", percent: 20 },
  vinayak123: { code: "Vinayak123", percent: 30 },
};

export function Theme2CartItems({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items.filter((item) => item.slug === slug));
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [cartNote, setCartNote] = useState("");
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState("");

  const currency = items[0]?.currency || "INR";
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountAmount = useMemo(() => (subtotal * appliedDiscountPercent) / 100, [subtotal, appliedDiscountPercent]);
  const grandTotal = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);
  const subtotalLabel = formatMoney(subtotal, currency);
  const discountAmountLabel = formatMoney(discountAmount, currency);
  const grandTotalLabel = formatMoney(grandTotal, currency);

  const checkoutMetaKey = `theme2CheckoutMeta:${slug}`;

  useEffect(() => {
    localStorage.setItem(
      checkoutMetaKey,
      JSON.stringify({
        cartNote,
        discountCode: appliedDiscountCode,
        discountPercentage: appliedDiscountPercent,
        discountAmount,
      }),
    );
  }, [checkoutMetaKey, cartNote, appliedDiscountCode, appliedDiscountPercent, discountAmount]);

  function clearDiscountState() {
    setDiscountCode("");
    setAppliedDiscountCode("");
    setAppliedDiscountPercent(0);
    setDiscountError("");
  }

  function applyDiscountCode() {
    const normalizedCode = discountCode.trim().toLowerCase();

    if (!normalizedCode) {
      setDiscountError("Please enter a discount code.");
      setAppliedDiscountCode("");
      setAppliedDiscountPercent(0);
      return;
    }

    const matchedCode = CART_DISCOUNT_CODES[normalizedCode];
    if (!matchedCode) {
      setDiscountError("Invalid code. Try Deva123 or Vinayak123.");
      setAppliedDiscountCode("");
      setAppliedDiscountPercent(0);
      return;
    }

    setAppliedDiscountCode(matchedCode.code);
    setAppliedDiscountPercent(matchedCode.percent);
    setDiscountError("");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.14em] text-[#536560]">Cart Items ({items.length})</p>
        <Link
          href={`/${slug}/product`}
          className="inline-flex border border-[#8fa29d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#304340] transition hover:bg-[#eef2ef]"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_290px]">
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

        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="border border-[#cad1ce] bg-[#f7f9f7] p-4 text-[#2f403d]">
            <button
              type="button"
              onClick={() => setIsNoteOpen((previous) => !previous)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.12em]">Add cart note</span>
              {isNoteOpen ? <X size={18} /> : <PlusIcon size={18} />}
            </button>
            {isNoteOpen ? (
              <textarea
                value={cartNote}
                onChange={(event) => setCartNote(event.target.value)}
                placeholder="Write a note for your order"
                className="mt-3 min-h-24 w-full border border-[#b9c2be] bg-white p-3 text-sm"
              />
            ) : null}
          </div>

          <div className="border border-[#cad1ce] bg-[#f7f9f7] p-4 text-[#2f403d]">
            <button
              type="button"
              onClick={() => setIsDiscountOpen((previous) => !previous)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.12em]">Discount</span>
              {isDiscountOpen ? <X size={18} /> : <PlusIcon size={18} />}
            </button>

            {isDiscountOpen ? (
              <div className="mt-3">
                <p className="text-xs text-[#5f726e]">Available: Deva123 (20%), Vinayak123 (30%)</p>
                <input
                  value={discountCode}
                  onChange={(event) => {
                    setDiscountCode(event.target.value);
                    if (discountError) setDiscountError("");
                  }}
                  placeholder="Enter discount code"
                  className="mt-2 h-11 w-full border border-[#b9c2be] bg-white px-3 text-sm"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={applyDiscountCode}
                    className="h-10 flex-1 bg-[#95af8f] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#809c7c]"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={clearDiscountState}
                    className="h-10 border border-[#b9c2be] px-4 text-xs font-semibold uppercase tracking-[0.14em]"
                  >
                    Clear
                  </button>
                </div>
                {discountError ? <p className="mt-2 text-xs text-red-600">{discountError}</p> : null}
                {appliedDiscountCode ? (
                  <p className="mt-2 text-xs text-emerald-700">
                    Code applied: {appliedDiscountCode} ({appliedDiscountPercent}% off)
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="border border-[#cad1ce] bg-[#f7f9f7] p-4 text-[#2f403d]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.12em]">Subtotal</span>
              <span className="text-base font-semibold">{subtotalLabel}</span>
            </div>
            {appliedDiscountCode ? (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span>Discount ({appliedDiscountPercent}%)</span>
                <span className="text-emerald-700">-{discountAmountLabel}</span>
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-between border-t border-[#d4dbd8] pt-3">
              <span className="text-sm font-semibold uppercase tracking-[0.12em]">Grand total</span>
              <span className="text-lg [font-family:var(--font-theme2-serif)]">{grandTotalLabel}</span>
            </div>
            <p className="mt-3 text-sm text-[#5f726e]">Taxes and shipping are calculated at checkout.</p>

            <Link
              href={`/${slug}/checkout`}
              className="mt-4 block h-11 bg-[#95af8f] py-3 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#809c7c]"
            >
              Check Out
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
