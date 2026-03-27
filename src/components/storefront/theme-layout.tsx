import {
  StoreThemeCart,
  StoreThemeCheckout,
  StoreThemeHome,
  StoreThemeProductDetail,
  StoreThemeProducts,
} from "@/themes/store-theme-renderer";
import type {
  ThemeCartProps,
  ThemeCheckoutProps,
  ThemeHomeProps,
  ThemeProductDetailProps,
  ThemeProductsProps,
} from "@/themes/types";

export function StorefrontHomeTheme(props: ThemeHomeProps) {
  return <StoreThemeHome {...props} />;
}

export function StorefrontProductsTheme(props: ThemeProductsProps) {
  return <StoreThemeProducts {...props} />;
}

export function StorefrontProductDetailTheme(props: ThemeProductDetailProps) {
  return <StoreThemeProductDetail {...props} />;
}

export function StorefrontCartTheme(props: ThemeCartProps) {
  return <StoreThemeCart {...props} />;
}

export function StorefrontCheckoutTheme(props: ThemeCheckoutProps) {
  return <StoreThemeCheckout {...props} />;
}
