"use client";
import React from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { StorefrontNavbar } from "@/components/storefront/storefront-navbar";
import { CartItems } from "@/components/storefront/cart-items";

export default function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  useCartStorage();

  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontNavbar logoText={slug} slug={slug} />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
        <div className="mt-6">
          <CartItems slug={slug} />
        </div>
      </main>
    </div>
  );
}
