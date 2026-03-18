"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { ProductDto } from "@/types";

type Props = {
  product: ProductDto;
  productHref?: string;
  onAddToCart?: (product: ProductDto) => void;
};

export function StoreProductCard({ product, productHref, onAddToCart }: Props) {
  const salePrice = product.price - product.price * (product.discount / 100);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {productHref ? (
        <Link href={productHref} className="block">
          <div className="relative h-52 w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      ) : (
        <div className="relative h-52 w-full">
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{product.name}</h3>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            {product.category}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>

        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-slate-900">{formatCurrency(salePrice, product.currency)}</p>
          {product.discount > 0 && (
            <>
              <p className="text-sm text-slate-400 line-through">
                {formatCurrency(product.price, product.currency)}
              </p>
              <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                {product.discount}% OFF
              </span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {productHref ? (
            <Link
              href={productHref}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700"
            >
              View Details
            </Link>
          ) : null}

          {onAddToCart ? (
            <Button className="flex-1 justify-center gap-2" onClick={() => onAddToCart(product)}>
              <ShoppingBag className="size-4" />
              Add
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
