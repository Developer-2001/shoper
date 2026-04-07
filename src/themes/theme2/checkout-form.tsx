"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Spinner } from "@/components/admin/ui/loader";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearSlugCart } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";

import { HelcimForm } from "@/components/checkout/helcim-form";
import type { StorefrontStore } from "@/themes/types";

type Theme2CheckoutFormProps = {
  slug: string;
  store: StorefrontStore;
};

type AddressState = {
  country: string;
  firstName: string;
  lastName: string;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
};

const EMPTY_ADDRESS: AddressState = {
  country: "India",
  firstName: "",
  lastName: "",
  shippingAddress: "",
  city: "",
  state: "",
  postalCode: "",
};

export function Theme2CheckoutForm({ slug, store }: Theme2CheckoutFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.slug === slug),
  );

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<AddressState>(EMPTY_ADDRESS);
  const [error, setError] = useState("");
  const [isHelcimActive, setIsHelcimActive] = useState(false);

  const availableProviders = [
    ...(store.paymentSettings?.stripe?.enabled ? ["stripe"] : []),
    ...(store.paymentSettings?.helcim?.enabled ? ["helcim"] : []),
  ];

  const [provider, setProvider] = useState(availableProviders[0] || "none");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateShipping(field: keyof AddressState, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  async function handleStripeCheckout() {
    if (!store.paymentSettings?.stripe?.enabled) {
      setError("Stripe is not enabled.");
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
          shipping: {
            ...shipping,
            countryCode: "IN", // Theme 2 is hardcoded for now, ideally would use a selector
            stateCode: "",
          },
          useShippingAsBilling: true,
          billing: shipping,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to initiate Stripe payment.");
        return;
      }

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error(err);
      setError("Network error during Stripe checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function handleHelcimCheckout(cardToken: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/store/${slug}/payment/helcim/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardToken,
          email,
          shipping: {
            ...shipping,
            countryCode: "IN",
            stateCode: "",
          },
          useShippingAsBilling: true,
          billing: shipping,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Helcim payment failed.");
        return;
      }

      dispatch(clearSlugCart({ slug }));
      router.push(`/${slug}/checkout/success`);
    } catch (err) {
      console.error(err);
      setError("Network error during Helcim checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/store/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping,
          useShippingAsBilling: true,
          billing: shipping,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to place order. Please check your details.");
        return;
      }

      dispatch(clearSlugCart({ slug }));
      alert("Order confirmed successfully");
      router.push(`/${slug}`);
    } catch (err) {
      console.error(err);
      setError("A network error occurred while placing your order.");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return <p className="text-amber-900">Cart is empty. Add products before checkout.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4 rounded-3xl border border-amber-200 bg-white p-5">
        <h2 className="text-xl font-black uppercase tracking-wide text-amber-900">
          Shipping Details
        </h2>

        <input
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email"
          className="w-full rounded-2xl border border-amber-200 px-4 py-2.5 text-amber-900 outline-none focus:border-amber-500"
        />

        {Object.keys(shipping).map((key) => (
          <input
            key={key}
            required
            value={shipping[key as keyof AddressState]}
            onChange={(event) =>
              updateShipping(key as keyof AddressState, event.target.value)
            }
            placeholder={key}
            className="w-full rounded-2xl border border-amber-200 px-4 py-2.5 text-amber-900 outline-none focus:border-amber-500"
          />
        ))}

        <div className="mt-8 border-t border-amber-100 pt-6">
          <h2 className="text-xl font-black uppercase tracking-wide text-amber-900">
            Payment Method
          </h2>
          <div className="mt-4 space-y-3">
            {store.paymentSettings?.stripe?.enabled && (
              <label
                className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                  provider === "stripe"
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                    : "border-amber-200 bg-white hover:border-amber-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="stripe"
                    checked={provider === "stripe"}
                    onChange={() => setProvider("stripe")}
                    className="h-4 w-4 accent-amber-600"
                  />
                  <span className="font-bold text-amber-900">Credit Card (Stripe)</span>
                </div>
              </label>
            )}

            {store.paymentSettings?.helcim?.enabled && (
              <div
                className={`rounded-2xl border transition-all ${
                  provider === "helcim"
                    ? "border-amber-500 bg-amber-50 ring-1 ring-amber-500"
                    : "border-amber-200 bg-white hover:border-amber-300"
                }`}
              >
                <label className="flex cursor-pointer items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentProvider"
                      value="helcim"
                      checked={provider === "helcim"}
                      onChange={() => setProvider("helcim")}
                      className="h-4 w-4 accent-amber-600"
                    />
                    <span className="font-bold text-amber-900">Credit Card (Helcim)</span>
                  </div>
                </label>

                {provider === "helcim" && (
                  <div className="border-t border-amber-200 p-4">
                    <HelcimForm
                      slug={slug}
                      accountId={store.paymentSettings.helcim.accountId}
                      amount={total}
                      currency={items[0]?.currency || "CAD"}
                      email={email}
                      shipping={shipping}
                      items={items}
                      onSuccess={handleHelcimCheckout}
                      onError={setError}
                      trigger={isHelcimActive}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="h-fit rounded-3xl border border-amber-200 bg-white p-5">
        <h3 className="text-lg font-black uppercase tracking-wide text-amber-900">Summary</h3>
        <p className="mt-3 text-amber-800">Items: {items.length}</p>
        <p className="text-2xl font-black text-amber-950">
          {formatMoney(total, items[0].currency)}
        </p>

        {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}

        <button
          type={provider === "stripe" ? "button" : "submit"}
          onClick={(e) => {
            if (provider === "stripe") {
              e.preventDefault();
              handleStripeCheckout();
            } else if (provider === "helcim" && !isHelcimActive) {
              e.preventDefault();
              setIsHelcimActive(true);
            }
          }}
          disabled={loading || provider === "none"}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-bold uppercase tracking-wide text-amber-950 transition hover:bg-amber-600 disabled:opacity-50"
        >
          {loading && <Spinner size={16} className="text-amber-950" />}
          {loading
            ? "Processing..."
            : provider === "stripe"
              ? "Pay with Stripe"
              : provider === "helcim"
                ? isHelcimActive ? "Complete Helcim Form" : "Pay now"
                : "Select Payment Method"}
        </button>
      </section>
    </form>
  );
}
