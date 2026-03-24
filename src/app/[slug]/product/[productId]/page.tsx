import { notFound } from "next/navigation";

import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";
import { StoreThemeProductDetail } from "@/themes/store-theme-renderer";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  await connectToDatabase();

  const routeParams = await params;

  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store || store.status === "inactive") {
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
    <StoreThemeProductDetail
      slug={routeParams.slug}
      store={JSON.parse(JSON.stringify(store))}
      product={JSON.parse(JSON.stringify(product))}
    />
  );
}
