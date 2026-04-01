"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Spinner } from "@/components/admin/ui/loader";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearSlugCart } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";

import type { StorefrontStore } from "@/themes/types";

type Theme1CheckoutFormProps = {
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

export function Theme1CheckoutForm({ slug, store }: Theme1CheckoutFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.slug === slug),
  );

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<AddressState>(EMPTY_ADDRESS);
  const [error, setError] = useState("");

  const availableProviders = [
    ...(store.paymentSettings?.stripe?.enabled ? ["stripe"] : []),
  ];

  const [provider, setProvider] = useState(availableProviders[0] || "none");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function updateShipping(field: keyof AddressState, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (provider === "none") {
      setError("Please select a payment method.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/store/${slug}/payment/session`, {
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
          provider,
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
        // Redux cart will be cleared on successful callback (webhook/success page)
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

  if (!items.length) {
    return <p className="text-slate-600">Cart is empty. Add products before checkout.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-slate-900">Shipping details</h2>

        <input
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email"
          className="w-full rounded-xl border border-slate-300 px-4 py-2"
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
          />
        ))}
      </section>

      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900">Summary</h3>
        <p className="mt-3 text-slate-600">Items: {items.length}</p>
        <p className="text-xl font-bold text-slate-900">
          {formatMoney(total, items[0].currency)}
        </p>

        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

        {!store.paymentSettings?.stripe?.enabled ? (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 border border-amber-200">
            <p className="text-sm text-amber-700 font-semibold">Online payments are currently unavailable for this store.</p>
          </div>
        ) : null}

        <button
          disabled={loading || !store.paymentSettings?.stripe?.enabled}
          className="flex items-center justify-center gap-2 mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading && <Spinner size={16} className="text-white" />}
          {loading ? "Initializing..." : "Buy now"}
        </button>
      </section>
    </form>
  );
}
