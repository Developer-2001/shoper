import type { ReactNode } from "react";
import Script from "next/script";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import {
  GA4_MEASUREMENT_ID,
  GTM_CONTAINER_ID,
  shouldTrackStorefrontTheme,
} from "@/lib/storefront-analytics/constants";
import { StorefrontRouteTracker } from "@/components/storefront/storefront-route-tracker";
import { resolveThemeLayout } from "@/themes/theme-config";

export default async function StorefrontSlugLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getActiveStoreBySlug(slug);
  const storeTheme = resolveThemeLayout(store?.theme?.layout);
  const shouldTrack = Boolean(store) && shouldTrackStorefrontTheme(store?.theme?.layout);

  if (!shouldTrack) {
    return <>{children}</>;
  }

  const contextPayload = JSON.stringify({
    event: "storefront_context",
    store_slug: slug,
    tenant_slug: slug,
    store_theme: storeTheme,
    ga4_measurement_id: GA4_MEASUREMENT_ID,
  });

  return (
    <>
      <Script id={`gtm-loader-${slug}`} strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; window.dataLayer.push(${contextPayload});(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`}
      </Script>

      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>

      <StorefrontRouteTracker slug={slug} storeTheme={storeTheme} />
      {children}
    </>
  );
}
