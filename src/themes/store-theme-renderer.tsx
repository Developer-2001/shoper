import { DEFAULT_THEME_LAYOUT, resolveThemeLayout, type ThemeLayout } from "@/themes/theme-config";
import { Theme1Home } from "@/themes/theme1/home";
import { Theme1ProductsPage } from "@/themes/theme1/products-page";
import { Theme1ProductDetailPage } from "@/themes/theme1/product-detail-page";
import { Theme1CartPage } from "@/themes/theme1/cart-page";
import { Theme1CheckoutPage } from "@/themes/theme1/checkout-page";
import { Theme2Home } from "@/themes/theme2/home";
import { Theme2ProductsPage } from "@/themes/theme2/products-page";
import { Theme2ProductDetailPage } from "@/themes/theme2/product-detail-page";
import { Theme2CartPage } from "@/themes/theme2/cart-page";
import { Theme2CheckoutPage } from "@/themes/theme2/checkout-page";
import type {
  ThemeCartProps,
  ThemeCheckoutProps,
  ThemeHomeProps,
  ThemeProductDetailProps,
  ThemeProductsProps,
} from "@/themes/types";

function normalizeStoreTheme<T extends { store: ThemeHomeProps["store"] }>(props: T): T & { layout: ThemeLayout } {
  const layout = resolveThemeLayout(props.store.theme?.layout ?? DEFAULT_THEME_LAYOUT);

  props.store.theme = {
    layout,
    primary: props.store.theme?.primary || "#0f172a",
    accent: props.store.theme?.accent || "#14b8a6",
    heroImage:
      props.store.theme?.heroImage ||
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
    sliderImages: props.store.theme?.sliderImages || [],
  };

  return { ...props, layout };
}

export function StoreThemeHome(input: ThemeHomeProps) {
  const props = normalizeStoreTheme(input);

  if (props.layout === "theme2") {
    return <Theme2Home {...props} />;
  }

  return <Theme1Home {...props} />;
}

export function StoreThemeProducts(input: ThemeProductsProps) {
  const props = normalizeStoreTheme(input);

  if (props.layout === "theme2") {
    return <Theme2ProductsPage {...props} />;
  }

  return <Theme1ProductsPage {...props} />;
}

export function StoreThemeProductDetail(input: ThemeProductDetailProps) {
  const props = normalizeStoreTheme(input);

  if (props.layout === "theme2") {
    return <Theme2ProductDetailPage {...props} />;
  }

  return <Theme1ProductDetailPage {...props} />;
}

export function StoreThemeCart(input: ThemeCartProps) {
  const props = normalizeStoreTheme(input);

  if (props.layout === "theme2") {
    return <Theme2CartPage {...props} />;
  }

  return <Theme1CartPage {...props} />;
}

export function StoreThemeCheckout(input: ThemeCheckoutProps) {
  const props = normalizeStoreTheme(input);

  if (props.layout === "theme2") {
    return <Theme2CheckoutPage {...props} />;
  }

  return <Theme1CheckoutPage {...props} />;
}
