import { notFound, redirect } from "next/navigation";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import { Theme3ContactPage } from "@/themes/theme3/contact-page";

export default async function StoreContactPage({
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

  return <Theme3ContactPage slug={routeParams.slug} store={store} />;
}
