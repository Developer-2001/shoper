"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StoreHeader } from "@/components/storefront/store-header";
import { http } from "@/lib/http";
import { addToCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/lib/utils";
import type { ProductDto, StoreDto } from "@/types";

type ProductDetailData = {
  store: StoreDto;
  product: ProductDto;
};

export default function ProductDetailPage() {
  const params = useParams<{ slug: string; productSlug: string }>();
  const slug = params.slug;
  const productSlug = params.productSlug;
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) =>
    state.cart.items.filter((item) => item.storeSlug === slug),
  );

  const [store, setStore] = useState<StoreDto | null>(null);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await http<ProductDetailData>(`/api/public/store/${slug}/products/${productSlug}`);
        setStore(data.store);
        setProduct(data.product);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Product not found");
      }
    }

    loadProduct();
  }, [slug, productSlug]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-2xl font-bold">Product not available</h1>
        <p className="text-slate-600">{error}</p>
        <Link href={`/${slug}/products`} className="font-semibold text-slate-900">Back to products</Link>
      </div>
    );
  }

  if (!store || !product) {
    return <div className="flex min-h-screen items-center justify-center">Loading product...</div>;
  }

  const salePrice = product.price - product.price * (product.discount / 100);

  return (
    <main className="min-h-screen">
      <StoreHeader slug={slug} businessName={store.businessName} cartCount={cartCount} />

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        </div>

        <div>
          <Link href={`/${slug}/products`} className="text-sm font-medium text-slate-600">
            Back to products
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{product.category}</p>

          <div className="mt-4 flex items-center gap-3">
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(salePrice, product.currency)}
            </p>
            {product.discount > 0 ? (
              <>
                <p className="text-base text-slate-400 line-through">
                  {formatCurrency(product.price, product.currency)}
                </p>
                <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {product.discount}% OFF
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-5 leading-relaxed text-slate-700">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                dispatch(
                  addToCart({
                    storeSlug: slug,
                    productId: product._id,
                    name: product.name,
                    image: product.images[0],
                    price: salePrice,
                    currency: product.currency,
                    quantity: 1,
                  }),
                );
              }}
            >
              Add to Cart
            </Button>

            <Link href={`/${slug}/cart`}>
              <Button variant="secondary">Go to Cart</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
