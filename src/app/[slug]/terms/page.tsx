import { notFound, redirect } from "next/navigation";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import { Theme1TermsPage } from "@/themes/theme1/terms-page";
import { Theme3TermsPage } from "@/themes/theme3/terms-page";

export default async function StoreTermsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const routeParams = await params;
  const store = await getActiveStoreBySlug(routeParams.slug);

  if (!store) {
    notFound();
  }

  const layout = resolveThemeLayout(store.theme?.layout);

  if (layout === "theme1") {
    return <Theme1TermsPage slug={routeParams.slug} store={store} />;
  }

  if (layout !== "theme3") {
    redirect(`/${routeParams.slug}`);
  }

  return <Theme3TermsPage slug={routeParams.slug} store={store} />;
}
