"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Spinner } from "@/components/admin/ui/loader";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearSlugCart } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

import type { StorefrontStore } from "@/themes/types";

const SHIPPING_CHARGE_PER_ITEM = 50;
const TAX_PERCENTAGE = 3;
const CHECKOUT_DISCOUNT_CODES: Record<string, { code: string; percent: number }> = {
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

export function Theme3CheckoutForm({ slug, store }: { slug: string; store: StorefrontStore }) {
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
  const [checkoutMeta, setCheckoutMeta] = useState<CheckoutMetaState>({
    cartNote: "",
    discountCode: "",
    discountPercentage: 0,
  });

  const checkoutMetaKey = `theme3CheckoutMeta:${slug}`;
  const currency = items[0]?.currency || "INR";
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
  const discountPercentage = matchedDiscount?.percent || checkoutMeta.discountPercentage || 0;
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
      setError("Stripe is not enabled for this store.");
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
          // Extract first validation error if it's a Zod error
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
          // Extract first validation error if it's a Zod error
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

  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[#d3b6b1] bg-[#f7e9e6] p-6 text-[#3f2019]">
        Cart is empty. Add products before checkout.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[1fr_500px]"
    >
      <section className="space-y-6 rounded-2xl border border-[#e8d6d2] bg-[#fcf5f4] p-5 md:p-7">
        <div>
          <h2 className="text-2xl font-semibold text-[#2f1f1a]">Contact</h2>
          <div className="mt-3">
            <label className="text-sm text-[#6f5048]" htmlFor="checkout-email">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#2f1f1a]">Shipping Address</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm text-[#6f5048]" htmlFor="shipping-country">
                Country
              </label>
              <input
                id="shipping-country"
                required
                value={shipping.country}
                onChange={(event) => updateShipping("country", event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              />
            </div>

            <div>
              <label className="text-sm text-[#6f5048]" htmlFor="shipping-firstName">
                First Name
              </label>
              <input
                id="shipping-firstName"
                required
                value={shipping.firstName}
                onChange={(event) => updateShipping("firstName", event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              />
            </div>

            <div>
              <label className="text-sm text-[#6f5048]" htmlFor="shipping-lastName">
                Last Name
              </label>
              <input
                id="shipping-lastName"
                required
                value={shipping.lastName}
                onChange={(event) => updateShipping("lastName", event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-[#6f5048]" htmlFor="shipping-address">
                Shipping Address
              </label>
              <input
                id="shipping-address"
                required
                value={shipping.shippingAddress}
                onChange={(event) =>
                  updateShipping("shippingAddress", event.target.value)
                }
                className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              />
            </div>

            <div>
              <label className="text-sm text-[#6f5048]" htmlFor="shipping-city">
                City
              </label>
              <input
                id="shipping-city"
                required
                value={shipping.city}
                onChange={(event) => updateShipping("city", event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              />
            </div>

            <div>
              <label className="text-sm text-[#6f5048]" htmlFor="shipping-state">
                State
              </label>
              <input
                id="shipping-state"
                required
                value={shipping.state}
                onChange={(event) => updateShipping("state", event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-[#6f5048]" htmlFor="shipping-postalCode">
                Postal Code
              </label>
              <input
                id="shipping-postalCode"
                required
                value={shipping.postalCode}
                onChange={(event) =>
                  updateShipping("postalCode", event.target.value)
                }
                className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-[#2f1f1a]">Billing Address</h2>
            <label className="inline-flex items-center gap-2 text-sm text-[#4f3d38]">
              <input
                type="checkbox"
                checked={useShippingAsBilling}
                onChange={(event) =>
                  setUseShippingAsBilling(event.target.checked)
                }
                className="h-4 w-4 accent-[#cc5639]"
              />
              Use shipping address as billing address
            </label>
          </div>

          {!useShippingAsBilling ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-[#6f5048]" htmlFor="billing-country">
                  Country
                </label>
                <input
                  id="billing-country"
                  required={!useShippingAsBilling}
                  value={billing.country}
                  onChange={(event) => updateBilling("country", event.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6f5048]" htmlFor="billing-firstName">
                  First Name
                </label>
                <input
                  id="billing-firstName"
                  required={!useShippingAsBilling}
                  value={billing.firstName}
                  onChange={(event) => updateBilling("firstName", event.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6f5048]" htmlFor="billing-lastName">
                  Last Name
                </label>
                <input
                  id="billing-lastName"
                  required={!useShippingAsBilling}
                  value={billing.lastName}
                  onChange={(event) => updateBilling("lastName", event.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-[#6f5048]" htmlFor="billing-address">
                  Shipping Address
                </label>
                <input
                  id="billing-address"
                  required={!useShippingAsBilling}
                  value={billing.shippingAddress}
                  onChange={(event) =>
                    updateBilling("shippingAddress", event.target.value)
                  }
                  className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6f5048]" htmlFor="billing-city">
                  City
                </label>
                <input
                  id="billing-city"
                  required={!useShippingAsBilling}
                  value={billing.city}
                  onChange={(event) => updateBilling("city", event.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
                />
              </div>
              <div>
                <label className="text-sm text-[#6f5048]" htmlFor="billing-state">
                  State
                </label>
                <input
                  id="billing-state"
                  required={!useShippingAsBilling}
                  value={billing.state}
                  onChange={(event) => updateBilling("state", event.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-[#6f5048]" htmlFor="billing-postalCode">
                  Postal Code
                </label>
                <input
                  id="billing-postalCode"
                  required={!useShippingAsBilling}
                  value={billing.postalCode}
                  onChange={(event) =>
                    updateBilling("postalCode", event.target.value)
                  }
                  className="mt-1 h-12 w-full rounded-xl border border-[#d2c0bc] bg-[#f6fbff] px-3 text-[#2f1f1a] outline-hidden focus:border-[#cc5639]"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-[#e8d6d2] bg-[#fcf5f4] p-5 md:sticky md:top-6">
        <h3 className="text-xl font-semibold text-[#2f1f1a]">Order Summary</h3>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#e6d8d4] bg-[#f8ece9]">
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
                <p className="truncate text-sm font-semibold text-[#2f1f1a]">{item.name}</p>
              </div>
              <p className="text-sm font-semibold text-[#2f1f1a]">
                {formatMoney(item.price * item.quantity, item.currency)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-[#e2cfcb] pt-4 text-sm text-[#3f2a24]">
          <div className="flex items-center justify-between">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          {discountCode ? (
            <div className="flex items-center justify-between text-emerald-700">
              <span>Discount ({discountCode})</span>
              <span>-{formatMoney(discountAmount, currency)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{formatMoney(shippingCharge, currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Estimated tax ({TAX_PERCENTAGE}%)</span>
            <span>{formatMoney(taxAmount, currency)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#e2cfcb] pt-3 text-xl font-bold text-[#2f1f1a]">
            <span>Total</span>
            <span>{formatMoney(total, currency)}</span>
          </div>
        </div>

        {checkoutMeta.cartNote ? (
          <p className="mt-3 rounded-lg bg-[#f8ece9] p-3 text-xs text-[#5f4d47]">
            Note: {checkoutMeta.cartNote}
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-[16px] font-semibold tracking-wide text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? <Spinner size={16} className="text-white" /> : null}
          {loading ? "Placing order..." : "Complete order"}
        </button>

        {store.paymentSettings?.stripe?.enabled && (
          <button
            type="button"
            onClick={handleStripeCheckout}
            disabled={loading}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#cc5639] text-[16px] font-semibold tracking-wide text-white transition hover:bg-[#b94d31] disabled:opacity-50"
          >
            {loading ? <Spinner size={16} className="text-white" /> : null}
            {loading ? "Redirecting..." : "Pay now"}
          </button>
        )}
      </aside>
    </form>
  );
}
