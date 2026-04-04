import { notFound, redirect } from "next/navigation";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import { Theme1ContactPage } from "@/themes/theme1/contact-page";
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

  const layout = resolveThemeLayout(store.theme?.layout);

  if (layout === "theme1") {
    return <Theme1ContactPage slug={routeParams.slug} store={store} />;
  }

  if (layout !== "theme3") {
    redirect(`/${routeParams.slug}`);
  }

  return <Theme3ContactPage slug={routeParams.slug} store={store} />;
}
