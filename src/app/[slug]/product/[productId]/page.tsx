import { notFound } from "next/navigation";

import { getStorefrontProductData } from "@/lib/storefront-data";
import { StorefrontProductDetailTheme } from "@/components/storefront/theme-layout";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const routeParams = await params;
  const storefrontData = await getStorefrontProductData(
    routeParams.slug,
    routeParams.productId,
  );

  if (!storefrontData) {
    notFound();
  }

  return (
    <StorefrontProductDetailTheme
      slug={routeParams.slug}
      store={storefrontData.store}
      product={storefrontData.product}
      products={storefrontData.products}
    />
  );
}
