"use client";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme2Navbar } from "@/themes/theme2/navbar";
import { Theme2Footer } from "@/themes/theme2/footer";
import { Theme2ProductCard } from "@/themes/theme2/product-card";
import type { ThemeProductsProps } from "@/themes/types";

export function Theme2ProductsPage({ slug, store, products }: ThemeProductsProps) {
  useCartStorage();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8e7_0%,#fff 45%)] text-amber-950">
      <Theme2Navbar slug={slug} logoText={store.logoText || store.businessName} accent={store.theme.accent} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-black uppercase">All Products</h1>
        <p className="mt-2 text-amber-800">Discover the full {store.businessName} catalog.</p>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Theme2ProductCard key={product._id} slug={slug} product={product} />
          ))}
        </div>
      </main>

      <Theme2Footer
        slug={slug}
        companyName={store.businessName}
        about={store.about}
        address={store.address}
        contactEmail={store.contactEmail}
        contactPhone={store.contactPhone}
        footerLinks={store.footerLinks || []}
      />
    </div>
  );
}
