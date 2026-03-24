import { notFound } from "next/navigation";

import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { StoreThemeCheckout } from "@/themes/store-theme-renderer";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();

  const routeParams = await params;
  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store || store.status === "inactive") {
    notFound();
  }

  return <StoreThemeCheckout slug={routeParams.slug} store={JSON.parse(JSON.stringify(store))} />;
}
