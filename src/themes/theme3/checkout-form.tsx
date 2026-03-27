"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/admin/ui/loader";
import { clearSlugCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { formatMoney } from "@/utils/currency";

export function Theme3CheckoutForm({ slug }: { slug: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items.filter((item) => item.slug === slug));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");

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
        setError(data.error || "Failed to place order.");
        return;
      }

      dispatch(clearSlugCart({ slug }));
      alert("Order confirmed successfully");
      router.push(`/${slug}`);
    } catch {
      setError("A network error occurred while placing your order.");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return <p className="text-rose-900">Cart is empty. Add products before checkout.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4 rounded-3xl border border-rose-200 bg-[#fff7f8] p-5">
        <h2 className="text-xl font-semibold text-rose-950">Shipping Details</h2>
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
            className="w-full rounded-2xl border border-rose-200 px-4 py-2.5 text-rose-900 outline-none focus:border-rose-400"
          />
        ))}
      </section>

      <section className="h-fit rounded-3xl border border-rose-200 bg-[#fff7f8] p-5">
        <h3 className="text-lg font-semibold text-rose-950">Summary</h3>
        <p className="mt-3 text-rose-800">Items: {items.length}</p>
        <p className="text-2xl font-bold text-rose-950">{formatMoney(total, items[0].currency)}</p>
        {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
        <button
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#cc5639] py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {loading && <Spinner size={16} className="text-white" />}
          {loading ? "Placing order..." : "Buy now"}
        </button>
      </section>
    </form>
  );
}
