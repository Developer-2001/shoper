import { notFound } from "next/navigation";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import { StorefrontCartTheme } from "@/components/storefront/theme-layout";

export default async function CartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const routeParams = await params;
  const store = await getActiveStoreBySlug(routeParams.slug);

  if (!store) {
    notFound();
  }

  return <StorefrontCartTheme slug={routeParams.slug} store={store} />;
}
