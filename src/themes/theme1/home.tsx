"use client";

import { StorefrontClient } from "@/components/storefront/storefront-client";
import type { ThemeHomeProps } from "@/themes/types";

export function Theme1Home({ slug, store, products }: ThemeHomeProps) {
  return <StorefrontClient slug={slug} store={store} products={products} />;
}
