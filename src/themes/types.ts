import type { ThemeLayout } from "@/themes/theme-config";

export type StorefrontStore = {
  _id?: string;
  businessName: string;
  logoText: string;
  about: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
  };
  footerLinks: { label: string; href: string }[];
  theme: {
    layout?: ThemeLayout | string;
    primary: string;
    accent: string;
    heroImage: string;
    sliderImages: string[];
    theme3?: {
      announcementText: string;
      collectionLabels: string[];
      collectionLabelImages: string[];
      featuredHeading: string;
    };
  };
};

export type StorefrontProduct = {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  category: string;
  discountPercentage: number;
  inStock: number;
};

export type ThemeHomeProps = {
  slug: string;
  store: StorefrontStore;
  products: StorefrontProduct[];
};

export type ThemeProductsProps = ThemeHomeProps;

export type ThemeProductDetailProps = {
  slug: string;
  store: StorefrontStore;
  product: StorefrontProduct;
};

export type ThemeCartProps = {
  slug: string;
  store: StorefrontStore;
};

export type ThemeCheckoutProps = ThemeCartProps;
