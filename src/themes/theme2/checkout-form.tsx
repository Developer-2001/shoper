"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Spinner } from "@/components/admin/ui/loader";
import { HelcimForm } from "@/components/checkout/helcim-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { clearSlugCart } from "@/store/slices/cartSlice";
import { formatMoney } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";
import { THEME2_COUNTRY_OPTIONS } from "@/themes/theme2/theme2-config";
import type { StorefrontStore } from "@/themes/types";
import { resolveCountryCode } from "@/lib/sales-tax";

type Theme2CheckoutFormProps = { slug: string; store: StorefrontStore };

type Address = {
  country: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
};

const emptyAddress: Address = {
  country: "Canada",
  countryCode: "CA",
  firstName: "",
  lastName: "",
  shippingAddress: "",
  city: "",
  state: "",
  postalCode: "",
};

export function Theme2CheckoutForm({ slug, store }: Theme2CheckoutFormProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items.filter((item) => item.slug === slug));
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState<Address>(emptyAddress);
  const [discountCode, setDiscountCode] = useState("");
  const [provider, setProvider] = useState("none");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHelcimActive, setIsHelcimActive] = useState(false);
  const [isHelcimInitializing, setIsHelcimInitializing] = useState(false);

  const availableProviders = [
    ...(store.paymentSettings?.stripe?.enabled ? ["stripe"] : []),
    ...(store.paymentSettings?.helcim?.enabled ? ["helcim"] : []),
  ];

  useEffect(() => {
    if (availableProviders.includes(provider)) return;
    setProvider(availableProviders[0] || "none");
  }, [availableProviders, provider]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discountAmount = discountCode ? subtotal * 0.1 : 0;
  const total = subtotal - discountAmount;
  const currency = items[0]?.currency || "CAD";

  function updateAddress(field: keyof Address, value: string) {
    setShipping((prev) => ({ ...prev, [field]: value }));
  }

  function validForm() {
    if (!email.trim()) return "Email required.";
    if (!shipping.firstName || !shipping.lastName) return "Name is required.";
    if (!shipping.shippingAddress || !shipping.city || !shipping.state || !shipping.postalCode) {
      return "Complete delivery address is required.";
    }
    return "";
  }

  async function handleStripeCheckout() {
    const invalid = validForm();
    if (invalid) return setError(invalid);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/store/${slug}/payment/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shipping,
          useShippingAsBilling: true,
          billing: shipping,
          discountCode,
          cartNote: localStorage.getItem(`theme2CheckoutMeta:${slug}`) || "",
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return setError(data.error || "Stripe checkout failed.");
      }
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch {
      setError("Network error during checkout.");
    } finally {
      setLoading(false);
    }
  }

  const handleHelcimCheckout = useCallback(async (transactionId: string) => {
    const invalid = validForm();
    if (invalid) return setError(invalid);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/store/${slug}/payment/helcim/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          email,
          shipping,
          useShippingAsBilling: true,
          billing: shipping,
          discountCode,
          cartNote: localStorage.getItem(`theme2CheckoutMeta:${slug}`) || "",
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return setError(data.error || "Helcim payment failed.");
      }
      dispatch(clearSlugCart({ slug }));
      window.location.href = `/${slug}`;
    } catch {
      setError("Network error during Helcim payment.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, email, shipping, discountCode, items, slug]);

  if (!items.length) return <p className="rounded border border-dashed p-8 text-center">Cart is empty.</p>;

  const input = "h-11 w-full rounded border border-[#d5d8dd] bg-white px-3 text-sm";

  return (
    <div className="[font-family:var(--font-theme2-sans)]">
      <div className="grid border border-[#d8dcdf] bg-white lg:grid-cols-[1fr_0.9fr]">
        <section className="space-y-6 px-6 py-8 md:px-10">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#6b737f]">EST 2015</p>
            <p className="text-3xl [font-family:var(--font-theme2-serif)]">PRESENT DAY</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#6b737f]">Gift Boxes & Baskets</p>
          </div>
          <button type="button" className="h-11 w-full rounded bg-[#5b3df4] text-white">shop</button>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="YOUR email (not your recipient's)" className={input} />
          <select
            value={shipping.country}
            onChange={(event) => {
              const country = event.target.value;
              setShipping((prev) => ({ ...prev, country, countryCode: resolveCountryCode(country) }));
            }}
            className={input}
          >
            {THEME2_COUNTRY_OPTIONS.map((item) => <option key={item.code} value={item.value}>{item.label}</option>)}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={shipping.firstName} onChange={(event) => updateAddress("firstName", event.target.value)} placeholder="First name" className={input} />
            <input value={shipping.lastName} onChange={(event) => updateAddress("lastName", event.target.value)} placeholder="Last name" className={input} />
          </div>
          <input value={shipping.shippingAddress} onChange={(event) => updateAddress("shippingAddress", event.target.value)} placeholder="Address" className={input} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={shipping.city} onChange={(event) => updateAddress("city", event.target.value)} placeholder="City" className={input} />
            <input value={shipping.state} onChange={(event) => updateAddress("state", event.target.value)} placeholder="Province" className={input} />
            <input value={shipping.postalCode} onChange={(event) => updateAddress("postalCode", event.target.value)} placeholder="Postal code" className={input} />
          </div>

          <div className="space-y-2 rounded border border-[#d7dce1] p-4">
            {store.paymentSettings?.stripe?.enabled && <label className="flex items-center gap-2"><input type="radio" name="provider" checked={provider === "stripe"} onChange={() => setProvider("stripe")} /> Credit card</label>}
            {store.paymentSettings?.helcim?.enabled && <label className="flex items-center gap-2"><input type="radio" name="provider" checked={provider === "helcim"} onChange={() => setProvider("helcim")} /> Credit card (Helcim)</label>}
            {!availableProviders.length && <p className="text-sm text-[#646f7a]">Payment provider not configured.</p>}
            {provider === "helcim" && store.paymentSettings?.helcim?.enabled && (
              <HelcimForm
                slug={slug}
                accountId={store.paymentSettings.helcim.accountId}
                amount={total}
                currency={currency}
                email={email}
                shipping={shipping}
                items={items}
                onSuccess={handleHelcimCheckout}
                onError={(message) => { setError(message); setIsHelcimInitializing(false); setIsHelcimActive(false); }}
                onReady={() => setIsHelcimInitializing(false)}
                trigger={isHelcimActive}
              />
            )}
          </div>

          {error ? <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            onClick={() => provider === "stripe" ? void handleStripeCheckout() : setIsHelcimActive(true)}
            disabled={loading || provider === "none" || (provider === "helcim" && isHelcimActive)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded bg-[#1696dc] text-white disabled:opacity-60"
          >
            {(loading || isHelcimInitializing) && <Spinner size={16} className="text-white" />}
            {provider === "helcim" && isHelcimActive ? "Complete payment above" : "Pay now"}
          </button>
        </section>

        <aside className="border-t bg-[#f7f7f8] px-6 py-8 lg:border-l lg:border-t-0">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="h-16 w-16 overflow-hidden rounded border bg-white">
                  {isVideoUrl(item.image) ? <video src={item.image} className="h-full w-full object-cover" muted /> : <Image src={item.image} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1"><p className="text-sm font-semibold">{item.name}</p><p className="text-xs">Qty {item.quantity}</p></div>
                <p className="text-sm font-semibold">{formatMoney(item.price * item.quantity, item.currency)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2"><input value={discountCode} onChange={(event) => setDiscountCode(event.target.value)} placeholder="Discount code" className={`${input} flex-1`} /><button type="button" className="h-11 rounded border px-4 text-sm">Apply</button></div>
          <div className="mt-6 space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal, currency)}</span></div>{discountCode ? <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{formatMoney(discountAmount, currency)}</span></div> : null}<div className="flex justify-between text-lg"><span>Total</span><span>{formatMoney(total, currency)}</span></div></div>
        </aside>
      </div>
    </div>
  );
}
