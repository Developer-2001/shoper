"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/admin/ui/loader";

import { clearSlugCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { formatMoney } from "@/utils/currency";

type Theme2CheckoutFormProps = {
  slug: string;
};

export function Theme2CheckoutForm({ slug }: Theme2CheckoutFormProps) {
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
  const [error, setError] = useState("");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/store/${slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
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
        <h2 className="text-xl font-black uppercase tracking-wide text-amber-900">Shipping Details</h2>
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
            className="w-full rounded-2xl border border-amber-200 px-4 py-2.5 text-amber-900 outline-none focus:border-amber-500"
          />
        ))}
      </section>

      <section className="h-fit rounded-3xl border border-amber-200 bg-white p-5">
        <h3 className="text-lg font-black uppercase tracking-wide text-amber-900">Summary</h3>
        <p className="mt-3 text-amber-800">Items: {items.length}</p>
        <p className="text-2xl font-black text-amber-950">{formatMoney(total, items[0].currency)}</p>

        {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}

        <button
          disabled={loading}
          className="flex items-center justify-center gap-2 mt-4 w-full rounded-full bg-amber-500 py-3 text-sm font-bold uppercase tracking-wide text-amber-950 disabled:opacity-50"
        >
          {loading && <Spinner size={16} className="text-amber-950" />}
          {loading ? "Placing order..." : "Buy now"}
        </button>
      </section>
    </form>
  );
}
