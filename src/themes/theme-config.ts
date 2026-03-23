export const THEME_LAYOUTS = ["theme1", "theme2"] as const;

export type ThemeLayout = (typeof THEME_LAYOUTS)[number];

export const DEFAULT_THEME_LAYOUT: ThemeLayout = "theme1";

export function resolveThemeLayout(layout: string | undefined | null): ThemeLayout {
  return THEME_LAYOUTS.includes(layout as ThemeLayout) ? (layout as ThemeLayout) : DEFAULT_THEME_LAYOUT;
}
