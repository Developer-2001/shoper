import { headers } from "next/headers";

import { getActiveStoreBySlug } from "@/lib/storefront-data";
import { resolveThemeLayout } from "@/themes/theme-config";
import { Theme1ProductDetailLoading } from "@/themes/theme1/product-detail-loading";
import { Theme3ProductDetailLoading } from "@/themes/theme3/product-detail-loading";

function extractSlugFromPath(pathname: string): string | null {
  const normalizedPath = pathname.split("?")[0]?.split("#")[0] ?? "";
  const segments = normalizedPath.split("/").filter(Boolean);
  if (!segments.length) return null;

  const [slug] = segments;
  if (!slug) return null;

  const reservedSlugs = new Set([
    "admin",
    "api",
    "contact",
    "privacy",
    "pricing",
    "terms",
    "_next",
  ]);
  if (reservedSlugs.has(slug)) return null;

  return slug;
}

function extractSlugFromHeaders(
  headerMap: Awaited<ReturnType<typeof headers>>,
): string | null {
  const rawCandidates = [
    headerMap.get("next-url"),
    headerMap.get("x-invoke-path"),
    headerMap.get("x-matched-path"),
    headerMap.get("referer"),
  ].filter(Boolean) as string[];

  for (const candidate of rawCandidates) {
    try {
      const maybeUrl = candidate.startsWith("http")
        ? new URL(candidate).pathname
        : candidate;
      const slug = extractSlugFromPath(maybeUrl);
      if (slug) return slug;
    } catch {
      const slug = extractSlugFromPath(candidate);
      if (slug) return slug;
    }
  }

  return null;
}

export default async function ProductDetailsLoadingPage() {
  const headerMap = await headers();
  const slug = extractSlugFromHeaders(headerMap);

  if (!slug) {
    return <Theme3ProductDetailLoading />;
  }

  try {
    const store = await getActiveStoreBySlug(slug);
    const layout = resolveThemeLayout(store?.theme?.layout);

    if (layout === "theme1") {
      return <Theme1ProductDetailLoading />;
    }
  } catch {
    return <Theme3ProductDetailLoading />;
  }

  return <Theme3ProductDetailLoading />;
}
