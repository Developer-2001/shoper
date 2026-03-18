import { ORDER_STATUSES, PRODUCT_CATEGORIES, SUPPORTED_CURRENCIES } from "@/lib/constants";

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type StoreTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

export type StoreHomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  sliderImages: string[];
  ctaText: string;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  x?: string;
  youtube?: string;
};

export type StoreDto = {
  _id: string;
  slug: string;
  businessName: string;
  businessEmail: string;
  ownerName: string;
  mobile: string;
  currency: Currency;
  logo?: string;
  address?: string;
  about?: string;
  contactEmail?: string;
  contactMobile?: string;
  socialLinks: SocialLinks;
  homeContent: StoreHomeContent;
  theme: StoreTheme;
  createdAt: string;
  updatedAt: string;
};

export type ProductDto = {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  currency: Currency;
  category: ProductCategory;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminDto = {
  _id: string;
  ownerName: string;
  businessEmail: string;
  mobile: string;
  businessName: string;
  currency: Currency;
  storeId: string;
};

export type CustomerDto = {
  _id: string;
  storeId: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  createdAt: string;
};

export type OrderItemDto = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type OrderDto = {
  _id: string;
  storeId: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemDto[];
  shippingAddress: string;
  createdAt: string;
};

export type SessionDto = {
  role: "admin";
  userId: string;
  storeId: string;
  name: string;
  email?: string;
  mobile?: string;
};
