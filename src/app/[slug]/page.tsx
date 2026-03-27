import { notFound } from "next/navigation";

import { getStorefrontHomeData } from "@/lib/storefront-data";
import { StorefrontHomeTheme } from "@/components/storefront/theme-layout";

export default async function StoreBySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const routeParams = await params;
  const storefrontData = await getStorefrontHomeData(routeParams.slug);

  if (!storefrontData) {
    notFound();
  }

  return (
    <StorefrontHomeTheme
      slug={routeParams.slug}
      store={storefrontData.store}
      products={storefrontData.products}
    />
  );
}
