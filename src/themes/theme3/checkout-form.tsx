"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Spinner } from "@/components/admin/ui/loader";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearSlugCart } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

import type { StorefrontStore } from "@/themes/types";

const SHIPPING_CHARGE_PER_ITEM = 0;
const TAX_PERCENTAGE = 3;
const CHECKOUT_DISCOUNT_CODES: Record<
  string,
  { code: string; percent: number }
> = {
  deva123: { code: "Deva123", percent: 20 },
  vinayak123: { code: "Vinayak123", percent: 30 },
};

type AddressFormState = {
  country: string;
  firstName: string;
  lastName: string;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
};

type CheckoutMetaState = {
  cartNote: string;
  discountCode: string;
  discountPercentage: number;
};

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

const EMPTY_ADDRESS: AddressFormState = {
  country: "India",
  firstName: "",
  lastName: "",
  shippingAddress: "",
  city: "",
  state: "",
  postalCode: "",
};

export function Theme3CheckoutForm({
  slug,
  store,
}: {
  slug: string;
  store: StorefrontStore;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.slug === slug),
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [billing, setBilling] = useState<AddressFormState>(EMPTY_ADDRESS);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [checkoutMeta, setCheckoutMeta] = useState<CheckoutMetaState>({
    cartNote: "",
    discountCode: "",
    discountPercentage: 0,
  });

  const checkoutMetaKey = `theme3CheckoutMeta:${slug}`;
  const currency = items[0]?.currency || "INR";
  const firstItem = items[0];

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const matchedDiscount = useMemo(() => {
    const normalized = checkoutMeta.discountCode.trim().toLowerCase();
    return CHECKOUT_DISCOUNT_CODES[normalized] || null;
  }, [checkoutMeta.discountCode]);

  const discountPercentage =
    matchedDiscount?.percent || checkoutMeta.discountPercentage || 0;
  const discountCode = matchedDiscount?.code || "";

  const discountAmount = useMemo(
    () => roundPrice((subtotal * discountPercentage) / 100),
    [subtotal, discountPercentage],
  );

  const shippingCharge = useMemo(
    () => roundPrice(itemCount * SHIPPING_CHARGE_PER_ITEM),
    [itemCount],
  );

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const taxAmount = useMemo(
    () => roundPrice((taxableAmount * TAX_PERCENTAGE) / 100),
    [taxableAmount],
  );

  const total = useMemo(
    () => roundPrice(taxableAmount + shippingCharge + taxAmount),
    [taxableAmount, shippingCharge, taxAmount],
  );

  const hasShippingAddress = shipping.shippingAddress.trim().length > 0;
  const shippingDisplayValue = hasShippingAddress
    ? formatMoney(shippingCharge, currency)
    : "Enter shipping address";

  useEffect(() => {
    const rawMeta = localStorage.getItem(checkoutMetaKey);
    if (!rawMeta) return;

    try {
      const parsedMeta = JSON.parse(rawMeta) as Partial<CheckoutMetaState>;
      setCheckoutMeta({
        cartNote: parsedMeta.cartNote || "",
        discountCode: parsedMeta.discountCode || "",
        discountPercentage:
          typeof parsedMeta.discountPercentage === "number"
            ? parsedMeta.discountPercentage
            : 0,
      });
    } catch {
      localStorage.removeItem(checkoutMetaKey);
    }
  }, [checkoutMetaKey]);

  function updateShipping(field: keyof AddressFormState, value: string) {
    setShipping((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateBilling(field: keyof AddressFormState, value: string) {
    setBilling((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleStripeCheckout() {
    if (!store.paymentSettings?.stripe?.enabled) {
      setError("This store is currently not set up to receive online payments.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/store/${slug}/payment/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping,
          useShippingAsBilling,
          billing: useShippingAsBilling ? shipping : billing,
          cartNote: checkoutMeta.cartNote,
          discountCode,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        let message = "Failed to initiate payment. Please check your details.";
        if (typeof data.error === "string") {
          message = data.error;
        } else if (data.error?.fieldErrors) {
          const firstKey = Object.keys(data.error.fieldErrors)[0];
          message = `${firstKey}: ${data.error.fieldErrors[firstKey][0]}`;
        }
        setError(message);
        return;
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        setError("Payment session initialization failed.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred while starting your payment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/store/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping,
          useShippingAsBilling,
          billing: useShippingAsBilling ? shipping : billing,
          cartNote: checkoutMeta.cartNote,
          discountCode,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        let message = "Failed to place order. Please check your details.";
        if (typeof data.error === "string") {
          message = data.error;
        } else if (data.error?.fieldErrors) {
          const firstKey = Object.keys(data.error.fieldErrors)[0];
          message = `${firstKey}: ${data.error.fieldErrors[firstKey][0]}`;
        }
        setError(message);
        return;
      }

      dispatch(clearSlugCart({ slug }));
      localStorage.removeItem(checkoutMetaKey);
      alert("Order confirmed successfully");
      router.push(`/${slug}`);
    } catch {
      setError("A network error occurred while placing your order.");
    } finally {
      setLoading(false);
    }
  }

  function handlePayNowClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (store.paymentSettings?.stripe?.enabled) {
      event.preventDefault();
      void handleStripeCheckout();
    }
  }

  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-700">
        Cart is empty. Add products before checkout.
      </p>
    );
  }

  const inputClass =
    "mt-1 h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

  const summaryDetails = (
    <>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {isVideoUrl(item.image) ? (
                <video
                  src={item.image}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {item.name}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {formatMoney(item.price * item.quantity, item.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span
            className={hasShippingAddress ? "text-slate-700" : "text-slate-500"}
          >
            {shippingDisplayValue}
          </span>
        </div>

        {discountCode ? (
          <div className="flex items-center justify-between text-emerald-700">
            <span>Discount ({discountCode})</span>
            <span>-{formatMoney(discountAmount, currency)}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <span>Estimated taxes ({TAX_PERCENTAGE}%)</span>
          <span>{formatMoney(taxAmount, currency)}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-xl font-semibold text-slate-900">Total</span>
          <div className="flex items-end gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {currency.toUpperCase()}
            </span>
            <span className="text-xl font-bold leading-none text-slate-900">
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
      </div>

      {checkoutMeta.cartNote ? (
        <p className="mt-3 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
          Note: {checkoutMeta.cartNote}
        </p>
      ) : null}
    </>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px] xl:gap-0 xl:rounded-2xl xl:border xl:border-slate-200 xl:bg-white"
    >
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-7 xl:rounded-none xl:border-r xl:border-slate-200 xl:border-l-0 xl:border-y-0 xl:pr-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Contact Information
          </h2>
          <div className="mt-3">
            <label className="text-sm text-slate-600" htmlFor="checkout-email">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Shipping Address
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-country"
              >
                Country
              </label>
              <input
                id="shipping-country"
                required
                value={shipping.country}
                onChange={(event) =>
                  updateShipping("country", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-firstName"
              >
                First Name
              </label>
              <input
                id="shipping-firstName"
                required
                value={shipping.firstName}
                onChange={(event) =>
                  updateShipping("firstName", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-lastName"
              >
                Last Name
              </label>
              <input
                id="shipping-lastName"
                required
                value={shipping.lastName}
                onChange={(event) =>
                  updateShipping("lastName", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div className="">
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-address"
              >
                Shipping Address
              </label>
              <input
                id="shipping-address"
                required
                value={shipping.shippingAddress}
                onChange={(event) =>
                  updateShipping("shippingAddress", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600" htmlFor="shipping-city">
                City
              </label>
              <input
                id="shipping-city"
                required
                value={shipping.city}
                onChange={(event) => updateShipping("city", event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-state"
              >
                State
              </label>
              <input
                id="shipping-state"
                required
                value={shipping.state}
                onChange={(event) =>
                  updateShipping("state", event.target.value)
                }
                className={inputClass}
              />
            </div>
            <div className="">
              <label
                className="text-sm text-slate-600"
                htmlFor="shipping-postalCode"
              >
                Postal Code
              </label>
              <input
                id="shipping-postalCode"
                required
                value={shipping.postalCode}
                onChange={(event) =>
                  updateShipping("postalCode", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              Billing Address
            </h2>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={useShippingAsBilling}
                onChange={(event) =>
                  setUseShippingAsBilling(event.target.checked)
                }
                className="h-4 w-4 accent-slate-700"
              />
              Use shipping address as billing address
            </label>
          </div>

          {!useShippingAsBilling ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-country"
                >
                  Country
                </label>
                <input
                  id="billing-country"
                  required={!useShippingAsBilling}
                  value={billing.country}
                  onChange={(event) =>
                    updateBilling("country", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-firstName"
                >
                  First Name
                </label>
                <input
                  id="billing-firstName"
                  required={!useShippingAsBilling}
                  value={billing.firstName}
                  onChange={(event) =>
                    updateBilling("firstName", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-lastName"
                >
                  Last Name
                </label>
                <input
                  id="billing-lastName"
                  required={!useShippingAsBilling}
                  value={billing.lastName}
                  onChange={(event) =>
                    updateBilling("lastName", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div className="">
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-address"
                >
                  Shipping Address
                </label>
                <input
                  id="billing-address"
                  required={!useShippingAsBilling}
                  value={billing.shippingAddress}
                  onChange={(event) =>
                    updateBilling("shippingAddress", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-city"
                >
                  City
                </label>
                <input
                  id="billing-city"
                  required={!useShippingAsBilling}
                  value={billing.city}
                  onChange={(event) =>
                    updateBilling("city", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-state"
                >
                  State
                </label>
                <input
                  id="billing-state"
                  required={!useShippingAsBilling}
                  value={billing.state}
                  onChange={(event) =>
                    updateBilling("state", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div className="">
                <label
                  className="text-sm text-slate-600"
                  htmlFor="billing-postalCode"
                >
                  Postal Code
                </label>
                <input
                  id="billing-postalCode"
                  required={!useShippingAsBilling}
                  value={billing.postalCode}
                  onChange={(event) =>
                    updateBilling("postalCode", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          ) : null}
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 xl:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
            aria-expanded={summaryOpen}
          >
            {summaryOpen ? (
              <>
                <p className="text-2xl font-semibold leading-none text-slate-900">
                  Order summary
                </p>
                <ChevronUp size={20} className="text-slate-700" />
              </>
            ) : (
              <>
                <div className="flex min-w-0 items-center gap-3">
                  {firstItem ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {isVideoUrl(firstItem.image) ? (
                        <video
                          src={firstItem.image}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <Image
                          src={firstItem.image}
                          alt={firstItem.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                  ) : null}
                  <div>
                    <p className="text-lg font-semibold leading-none text-slate-900">
                      Total
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {itemCount} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                    {currency.toUpperCase()}
                  </span>
                  <span className="text-lg font-bold leading-none text-slate-900">
                    {formatMoney(total, currency)}
                  </span>
                  <ChevronDown size={20} className="text-slate-700" />
                </div>
              </>
            )}
          </button>

          {summaryOpen ? summaryDetails : null}

          <button
            type="submit"
            onClick={handlePayNowClick}
            disabled={loading || !store.paymentSettings?.stripe?.enabled}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1663d6] text-lg font-semibold text-white transition hover:bg-[#1257bc] disabled:opacity-50"
          >
            {loading ? <Spinner size={16} className="text-white" /> : null}
            {loading
              ? store.paymentSettings?.stripe?.enabled
                ? "Redirecting..."
                : "Processing..."
              : store.paymentSettings?.stripe?.enabled
                ? "Pay now"
                : "Payment not ready"}
          </button>

          {error && !summaryOpen ? (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          ) : null}
        </section>
      </section>

      <aside className="hidden p-6 xl:block xl:pl-8 2xl:sticky 2xl:top-6">
        <h3 className="text-2xl font-semibold text-slate-900">Order summary</h3>
        {summaryDetails}

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          onClick={handlePayNowClick}
          disabled={loading || !store.paymentSettings?.stripe?.enabled}
          className="mt-4 flex h-12 cursor-pointer w-full items-center justify-center gap-2 rounded-xl bg-[#1663d6] text-lg font-semibold text-white transition hover:bg-[#1257bc] disabled:opacity-50"
        >
          {loading ? <Spinner size={16} className="text-white" /> : null}
          {loading
            ? store.paymentSettings?.stripe?.enabled
              ? "Redirecting..."
              : "Processing..."
            : store.paymentSettings?.stripe?.enabled
              ? "Pay now"
              : "Payment not ready"}
        </button>
      </aside>
    </form>
  );
}
