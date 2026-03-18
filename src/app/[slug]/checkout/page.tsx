"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { StorefrontNavbar } from "@/components/storefront/storefront-navbar";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontNavbar logoText={params.slug} slug={params.slug} />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <div className="mt-6">
          <CheckoutForm slug={params.slug} />
        </div>
      </main>
    </div>
  );
}
