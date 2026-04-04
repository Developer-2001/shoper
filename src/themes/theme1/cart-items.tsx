"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { removeFromCart, updateCartQty } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

const CART_DISCOUNT_CODES: Record<string, { code: string; percent: number }> = {
  deva123: { code: "Deva123", percent: 20 },
  vinayak123: { code: "Vinayak123", percent: 30 },
};

export function Theme1CartItems({ slug }: { slug: string }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.slug === slug),
  );

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [cartNote, setCartNote] = useState("");
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState("");

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const currency = items[0]?.currency || "INR";
  const subtotalText = useMemo(
    () => formatMoney(total, currency),
    [total, currency],
  );
  const discountAmount = useMemo(
    () => (total * appliedDiscountPercent) / 100,
    [total, appliedDiscountPercent],
  );
  const grandTotal = useMemo(
    () => Math.max(0, total - discountAmount),
    [total, discountAmount],
  );
  const discountAmountText = useMemo(
    () => formatMoney(discountAmount, currency),
    [discountAmount, currency],
  );
  const grandTotalText = useMemo(
    () => formatMoney(grandTotal, currency),
    [grandTotal, currency],
  );
  const checkoutMetaKey = `Theme1CheckoutMeta:${slug}`;

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
  }, [
    checkoutMetaKey,
    cartNote,
    appliedDiscountCode,
    appliedDiscountPercent,
    discountAmount,
  ]);

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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-700">
        <p className="text-2xl font-semibold">Your cart is empty</p>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Browse collections and add your favorite pieces.
        </p>
        <Link
          href={`/${slug}/product`}
          className="mt-5 inline-flex rounded-xl bg-[#1d4ed8] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#1e40af]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
          Cart Item - ({items.length})
        </h2>
        <Link
          href={`/${slug}/product`}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold tracking-wide text-white transition hover:bg-blue-700 sm:text-base"
        >
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="rounded-2xl bg-slate-100 p-4 sm:p-5 md:p-8">
          <div className="divide-y divide-slate-200">
            {items.map((item, index) => {
              const disableDecrement = item.quantity <= 1;

              return (
                <div
                  key={`${item.productId}-${index}`}
                  className={`grid gap-5 py-6 lg:grid-cols-[160px_minmax(0,1fr)_180px] ${index === 0 ? "pt-2" : ""}`}
                >
                  <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100 sm:h-44">
                    {isVideoUrl(item.image) ? (
                      <video
                        src={item.image}
                        className="h-full w-full object-cover"
                        muted
                        controls
                      />
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                        width={220}
                        height={220}
                      />
                    )}
                  </div>

                  <div className="space-y-2 md:pt-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.06em] text-slate-500">
                      Item {index + 1}
                    </p>
                    <p className="text-base font-medium leading-tight text-slate-900 sm:text-lg">
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <span className="text-lg font-medium text-slate-900 sm:text-xl">
                        {formatMoney(item.price, item.currency)}
                      </span>
                      <span className="text-lg text-slate-600 sm:text-xl">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <p className="text-base text-slate-600 sm:text-lg">
                      Item total:{" "}
                      {formatMoney(item.price * item.quantity, item.currency)}
                    </p>
                  </div>

                  <div className="space-y-3 lg:justify-self-end">
                    <div className="flex h-14 items-center justify-between rounded-xl border border-slate-300 bg-white px-3">
                      <button
                        type="button"
                        disabled={disableDecrement}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#1d4ed8] transition hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
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
                        <Minus size={18} />
                      </button>
                      <span className="w-8 text-center text-xl font-medium text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-[#1d4ed8] transition hover:bg-slate-100"
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
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold cursor-pointer tracking-wide text-white transition hover:bg-red-600 sm:h-14 sm:text-base"
                      onClick={() =>
                        dispatch(
                          removeFromCart({ productId: item.productId, slug }),
                        )
                      }
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Note Section */}
        <div className="h-fit space-y-4 self-start 2xl:sticky 2xl:top-6">
          <div className="rounded-xl bg-slate-100 p-4">
            <button
              type="button"
              onClick={() => setIsNoteOpen((prev) => !prev)}
              className="flex w-full cursor-pointer items-center justify-between text-left"
            >
                <span className="text-lg font-semibold text-slate-900">
                  Add cart note
                </span>
              {isNoteOpen ? <X size={24} /> : <PlusIcon size={24} />}
            </button>

            {isNoteOpen ? (
              <div className="mt-1">
                <textarea
                  value={cartNote}
                  onChange={(event) => setCartNote(event.target.value)}
                  placeholder="Write a note for your order"
                  className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <button
              type="button"
              onClick={() => setIsDiscountOpen((prev) => !prev)}
              className="flex w-full cursor-pointer items-center justify-between text-left"
            >
              <span className="text-lg font-semibold text-slate-900">
                Discount
              </span>
              {isDiscountOpen ? <X size={24} /> : <PlusIcon size={24} />}
            </button>

            {isDiscountOpen ? (
              <div className="">
                <p className="text-sm text-slate-600">Enter discount code *</p>
                <p className="mt-1 text-xs text-slate-500">
                  Available: Deva123 (20%), Vinayak123 (30%)
                </p>
                <div className="relative mt-2">
                  <input
                    value={discountCode}
                    onChange={(event) => {
                      setDiscountCode(event.target.value);
                      if (discountError) {
                        setDiscountError("");
                      }
                    }}
                    placeholder="Enter discount code"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 pr-10 text-[16px] text-slate-900"
                  />
                  {discountCode ? (
                    <button
                      type="button"
                      onClick={clearDiscountState}
                      className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Clear discount code"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={applyDiscountCode}
                  className="mt-3 h-12 w-full rounded-xl bg-[#1d4ed8] text-base font-semibold tracking-wide text-white transition hover:bg-[#1e40af]"
                >
                  Apply
                </button>
                {discountError ? (
                  <p className="mt-2 text-xs text-red-600">{discountError}</p>
                ) : null}
                {appliedDiscountCode ? (
                  <p className="mt-2 text-xs text-emerald-700">
                    Code applied: {appliedDiscountCode} (
                    {appliedDiscountPercent}% off)
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">
                Subtotal:
              </span>
              <span className="text-lg font-bold text-slate-900">
                {subtotalText}
              </span>
            </div>
            {appliedDiscountCode ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-medium text-slate-600">
                  Discount ({appliedDiscountPercent}%)
                </span>
                <span className="text-base font-semibold text-emerald-700">
                  -{discountAmountText}
                </span>
              </div>
            ) : null}
            <p className="mt-4 text-base text-slate-600">
              Taxes, discounts and shipping calculated at checkout.
            </p>
            <Link
              href={`/${slug}/checkout`}
              className="mt-4 block rounded-xl bg-[#1d4ed8] py-3 text-center text-[16px] font-semibold tracking-wide text-white transition hover:bg-[#1e40af]"
            >
              Checkout
            </Link>
            <p className="mt-2 text-right text-lg font-medium text-slate-600">
              Grand total: {grandTotalText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}





