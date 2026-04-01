import { notFound, redirect } from "next/navigation";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import { Theme3PrivacyPage } from "@/themes/theme3/privacy-page";

export default async function StorePrivacyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const routeParams = await params;
  const store = await getActiveStoreBySlug(routeParams.slug);

  if (!store) {
    notFound();
  }

  if (resolveThemeLayout(store.theme?.layout) !== "theme3") {
    redirect(`/${routeParams.slug}`);
  }

  return <Theme3PrivacyPage slug={routeParams.slug} store={store} />;
}
