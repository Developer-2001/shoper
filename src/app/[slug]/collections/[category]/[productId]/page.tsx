import { notFound, redirect } from "next/navigation";

import { getStorefrontProductData } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import { categoryMatchesCollectionSlug, toCollectionSlug } from "@/themes/theme3/collection-utils";
import { Theme3ProductDetailPage } from "@/themes/theme3/product-detail-page";

export default async function CollectionProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; category: string; productId: string }>;
}) {
  const routeParams = await params;
  const storefrontData = await getStorefrontProductData(
    routeParams.slug,
    routeParams.productId,
  );

  if (!storefrontData) {
    notFound();
  }

  const layout = resolveThemeLayout(storefrontData.store.theme?.layout);
  if (layout !== "theme3") {
    redirect(`/${routeParams.slug}/product/${routeParams.productId}`);
  }

  const productCategory = storefrontData.product.category || "uncategorized";
  if (!categoryMatchesCollectionSlug(productCategory, routeParams.category)) {
    redirect(
      `/${routeParams.slug}/collections/${toCollectionSlug(productCategory)}/${routeParams.productId}`,
    );
  }

  return (
    <Theme3ProductDetailPage
      slug={routeParams.slug}
      store={storefrontData.store}
      product={storefrontData.product}
    />
  );
}
