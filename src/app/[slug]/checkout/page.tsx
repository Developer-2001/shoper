import { notFound } from "next/navigation";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import { StorefrontCheckoutTheme } from "@/components/storefront/theme-layout";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const routeParams = await params;
  const store = await getActiveStoreBySlug(routeParams.slug);

  if (!store) {
    notFound();
  }

  return <StorefrontCheckoutTheme slug={routeParams.slug} store={store} />;
}
