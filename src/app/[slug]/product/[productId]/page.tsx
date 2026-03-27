import { notFound, redirect } from "next/navigation";

import { getStorefrontProductData } from "@/lib/storefront-data";
import { StorefrontProductDetailTheme } from "@/components/storefront/theme-layout";
import { resolveThemeLayout } from "@/themes/theme-config";
import { toCollectionSlug } from "@/themes/theme3/collection-utils";

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

  if (resolveThemeLayout(storefrontData.store.theme?.layout) === "theme3") {
    redirect(
      `/${routeParams.slug}/collections/${toCollectionSlug(
        storefrontData.product.category || "uncategorized",
      )}/${routeParams.productId}`,
    );
  }

  return (
    <StorefrontProductDetailTheme
      slug={routeParams.slug}
      store={storefrontData.store}
      product={storefrontData.product}
    />
  );
}
