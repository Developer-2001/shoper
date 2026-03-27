import { notFound, redirect } from "next/navigation";

import { getStorefrontHomeData } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import { Theme3CollectionsPage } from "@/themes/theme3/collections-page";

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
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

  return (
    <Theme3CollectionsPage
      slug={routeParams.slug}
      store={storefrontData.store}
      products={storefrontData.products}
    />
  );
}
