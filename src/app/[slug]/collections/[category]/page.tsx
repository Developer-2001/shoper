import { notFound, redirect } from "next/navigation";

import { getStorefrontHomeData } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import {
  categoryMatchesCollectionSlug,
} from "@/themes/theme3/collection-utils";
import { Theme3CollectionProductsPage } from "@/themes/theme3/collection-products-page";

export default async function CollectionCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  const routeParams = await params;
  const storefrontData = await getStorefrontHomeData(routeParams.slug);

  if (!storefrontData) {
    notFound();
  }

  const layout = resolveThemeLayout(storefrontData.store.theme?.layout);
  if (layout !== "theme3") {
    redirect(`/${routeParams.slug}/products`);
  }

  const categoryProducts = storefrontData.products.filter((product) =>
    categoryMatchesCollectionSlug(product.category || "uncategorized", routeParams.category),
  );

  if (!categoryProducts.length) {
    notFound();
  }

  return (
    <Theme3CollectionProductsPage
      slug={routeParams.slug}
      store={storefrontData.store}
      categorySlug={routeParams.category}
      categoryLabel={categoryProducts[0].category || "Collection"}
      categoryProducts={categoryProducts}
    />
  );
}
