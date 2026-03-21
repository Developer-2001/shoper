import { notFound } from "next/navigation";

import { StorefrontNavbar } from "@/components/storefront/storefront-navbar";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  await connectToDatabase();

  const routeParams = await params;

  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store) {
    notFound();
  }

  const product = await Product.findOne({
    _id: routeParams.productId,
    storeId: store._id,
  }).lean();

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StorefrontNavbar logoText={store.logoText || store.businessName} slug={routeParams.slug} />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <ProductDetailClient
          slug={routeParams.slug}
          product={JSON.parse(JSON.stringify(product))}
        />
      </main>
    </div>
  );
}
