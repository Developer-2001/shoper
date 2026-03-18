export const PRODUCT_CATEGORIES = [
  "Jewellery",
  "Imitation Jewellery",
  "Watches",
  "Sunglasses",
  "Prescription Glasses",
] as const;

export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AED",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Home", href: "/admin/home" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Configure Store", href: "/admin/configure-store" },
  { label: "Profile", href: "/admin/profile" },
  { label: "Customers", href: "/admin/customers" },
] as const;
