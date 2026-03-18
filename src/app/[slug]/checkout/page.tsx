"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/http";
import { clearStoreCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const items = useAppSelector((state) =>
    state.cart.items.filter((item) => item.storeSlug === slug),
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await http<{ order: { _id: string } }>(`/api/public/store/${slug}/checkout`, {
        method: "POST",
        body: {
          customer: {
            name: form.name,
            email: form.email,
            mobile: form.mobile,
          },
          shippingAddress: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country,
          },
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      });

      dispatch(clearStoreCart(slug));
      router.replace(`/${slug}/order-success/${data.order._id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="mt-2 text-slate-600">Your cart is empty.</p>
          <Button className="mt-4" onClick={() => router.push(`/${slug}/products`)}>
            Browse Products
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={handleCheckout}>
          <h2 className="text-lg font-semibold">Customer Information</h2>
          <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <Input placeholder="Mobile" value={form.mobile} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} required />

          <h2 className="pt-2 text-lg font-semibold">Shipping Address</h2>
          <Input placeholder="Address Line 1" value={form.line1} onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))} required />
          <Input placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required />
            <Input placeholder="State" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} required />
            <Input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} required />
            <Input placeholder="Country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} required />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Placing order..." : "Confirm Checkout"}
          </Button>
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <p>{item.name} x {item.quantity}</p>
                <p>{formatCurrency(item.price * item.quantity, item.currency)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(total, items[0].currency)}</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
