"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { clearSlugCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { formatMoney } from "@/utils/currency";

type Theme1CheckoutFormProps = {
  slug: string;
};

export function Theme1CheckoutForm({ slug }: Theme1CheckoutFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items.filter((item) => item.slug === slug));

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    mobile: "",
    shippingAddress: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/store/${slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      alert("Failed to place order");
      return;
    }

    dispatch(clearSlugCart({ slug }));
    alert("Order confirmed successfully");
    router.push(`/${slug}`);
  }

  if (!items.length) {
    return <p className="text-slate-600">Cart is empty. Add products before checkout.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-slate-900">Shipping details</h2>
        {Object.keys(form).map((key) => (
          <input
            key={key}
            required
            value={form[key as keyof typeof form]}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                [key]: event.target.value,
              }))
            }
            placeholder={key}
            className="w-full rounded-xl border border-slate-300 px-4 py-2"
          />
        ))}
      </section>

      <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900">Summary</h3>
        <p className="mt-3 text-slate-600">Items: {items.length}</p>
        <p className="text-xl font-bold text-slate-900">{formatMoney(total, items[0].currency)}</p>
        <button disabled={loading} className="mt-4 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50">
          {loading ? "Placing order..." : "Buy now"}
        </button>
      </section>
    </form>
  );
}
