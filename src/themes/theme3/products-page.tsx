"use client";

import { useMemo, useState } from "react";

import { useCartStorage } from "@/hooks/useCartStorage";
import { Theme3Navbar } from "@/themes/theme3/navbar";
import { Theme3Footer } from "@/themes/theme3/footer";
import { Theme3CartToastProvider } from "@/themes/theme3/cart-toast";
import { Theme3ProductCard } from "@/themes/theme3/product-card";
import type { ThemeProductsProps } from "@/themes/types";

export function Theme3ProductsPage({ slug, store, products }: ThemeProductsProps) {
  useCartStorage();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [stockOnly, setStockOnly] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = products.filter((product) => {
      if (query && !`${product.name} ${product.description}`.toLowerCase().includes(query)) return false;
      if (category !== "all" && product.category !== category) return false;
      if (stockOnly && (product.inStock ?? 0) <= 0) return false;
      return true;
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, category, sortBy, stockOnly]);

  return (
    <Theme3CartToastProvider>
      <div className="min-h-screen bg-[#fff2f5] text-rose-950">
        <Theme3Navbar slug={slug} logoText={store.logoText || store.businessName} />

      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-semibold">Jewellery Collection</h1>
        <p className="mt-2 text-rose-900/80">Filter and discover curated pieces for every style.</p>

        <div className="mt-6 grid gap-3 rounded-2xl border border-rose-200 bg-[#fff7f8] p-4 md:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="rounded-xl border border-rose-200 px-3 py-2 outline-none focus:border-rose-400"
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-rose-200 px-3 py-2">
            <option value="all">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-rose-200 px-3 py-2">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
          <label className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold">
            <input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} />
            In-stock only
          </label>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Theme3ProductCard key={product._id} slug={slug} product={product} />
          ))}
        </div>

        {!filteredProducts.length ? (
          <p className="mt-8 rounded-2xl border border-dashed border-rose-300 p-6 text-center text-rose-800">No products found for selected filters.</p>
        ) : null}
      </main>

        <Theme3Footer
          slug={slug}
          companyName={store.businessName}
          about={store.about}
          address={store.address}
          contactEmail={store.contactEmail}
          contactPhone={store.contactPhone}
          footerLinks={store.footerLinks || []}
          socialLinks={store.socialLinks}
        />
      </div>
    </Theme3CartToastProvider>
  );
}

