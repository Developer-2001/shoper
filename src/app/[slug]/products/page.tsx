import { notFound } from "next/navigation";

import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";
import { StoreThemeProducts } from "@/themes/store-theme-renderer";

export default async function ProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();

  const routeParams = await params;

  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store) {
    notFound();
  }

  const products = await Product.find({ storeId: store._id, isPublished: true })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <StoreThemeProducts
      slug={routeParams.slug}
      store={JSON.parse(JSON.stringify(store))}
      products={JSON.parse(JSON.stringify(products))}
    />
  );
}
