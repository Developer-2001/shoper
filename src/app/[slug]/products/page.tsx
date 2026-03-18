"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreProductCard } from "@/components/storefront/store-product-card";
import { StoreHeader } from "@/components/storefront/store-header";
import { http } from "@/lib/http";
import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ProductDto, StoreDto } from "@/types";

type ProductsApiData = {
  store: StoreDto;
  products: ProductDto[];
};

export default function StoreProductsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) =>
    state.cart.items.filter((item) => item.storeSlug === slug),
  );

  const [store, setStore] = useState<StoreDto | null>(null);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await http<ProductsApiData>(`/api/public/store/${slug}/products`);
        setStore(data.store);
        setProducts(data.products);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Store not found");
      }
    }

    loadProducts();
  }, [slug]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [products, search]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-bold">Store not available</h1>
        <p className="text-slate-600">{error}</p>
        <Link href="/" className="font-semibold text-slate-900">Back to Home</Link>
      </div>
    );
  }

  if (!store) {
    return <div className="flex min-h-screen items-center justify-center">Loading products...</div>;
  }

  return (
    <main className="min-h-screen">
      <StoreHeader slug={slug} businessName={store.businessName} cartCount={cartCount} />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href={`/${slug}`} className="text-sm font-medium text-slate-600">
              Back to Store Home
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">All Products</h1>
          </div>

          <Link href={`/${slug}/cart`}>
            <Button>Go to Cart</Button>
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search by product or category"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button onClick={() => setSearch("")} variant="ghost">
            Clear
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-600">No matching products found.</p>
          ) : (
            filtered.map((product) => (
              <StoreProductCard
                key={product._id}
                product={product}
                productHref={`/${slug}/products/${product.slug}`}
                onAddToCart={(item) => {
                  dispatch(
                    addToCart({
                      storeSlug: slug,
                      productId: item._id,
                      name: item.name,
                      image: item.images[0],
                      price: item.price - item.price * (item.discount / 100),
                      currency: item.currency,
                      quantity: 1,
                    }),
                  );
                }}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
