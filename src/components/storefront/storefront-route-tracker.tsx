"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { trackStorefrontEvent } from "@/lib/storefront-analytics/client";

function resolvePageType(slug: string, pathname: string) {
  const basePath = `/${slug}`;

  if (pathname === basePath) return "home";
  if (pathname === `${basePath}/product`) return "product_list";
  if (pathname.startsWith(`${basePath}/product/`)) return "product_detail";
  if (pathname === `${basePath}/cart`) return "cart";
  if (pathname === `${basePath}/checkout`) return "checkout";
  if (pathname === `${basePath}/checkout/success`) return "checkout_success";
  if (pathname === `${basePath}/checkout/cancel`) return "checkout_cancel";
  if (pathname === `${basePath}/contact`) return "contact";
  if (pathname === `${basePath}/privacy`) return "privacy";
  if (pathname === `${basePath}/terms`) return "terms";
  return "storefront_other";
}

export function StorefrontRouteTracker({
  slug,
  storeTheme,
}: {
  slug: string;
  storeTheme: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const fullPath = query ? `${pathname}?${query}` : pathname;

    trackStorefrontEvent({
      event: "store_page_view",
      slug,
      storeTheme,
      page_type: resolvePageType(slug, pathname),
      page_path: fullPath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [slug, storeTheme, pathname, query]);

  return null;
}
