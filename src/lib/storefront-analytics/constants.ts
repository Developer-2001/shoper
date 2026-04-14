import { resolveThemeLayout } from "@/themes/theme-config";

export const GTM_CONTAINER_ID = "GTM-NWSK7737";
export const GA4_MEASUREMENT_ID = "G-XLYSHZEPPF";

export function shouldTrackStorefrontTheme(layout: string | undefined | null) {
  const normalizedLayout = resolveThemeLayout(layout);
  return normalizedLayout === "theme1" || normalizedLayout === "theme3";
}
