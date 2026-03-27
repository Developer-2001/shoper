import { z } from "zod";

import { DEFAULT_THEME_LAYOUT, THEME_LAYOUTS } from "@/themes/theme-config";

export const registerSchema = z.object({
  businessName: z.string().min(2),
  businessEmail: z.string().email(),
  mobile: z.string().min(8),
  ownerName: z.string().min(2),
  currency: z.string().min(1),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  themeLayout: z.enum(THEME_LAYOUTS).default(DEFAULT_THEME_LAYOUT),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  images: z.array(z.string().url()).min(1),
  price: z.coerce.number().positive(),
  currency: z.string().min(1),
  category: z.string().min(2),
  discountPercentage: z.coerce.number().min(0).max(90).default(0),
  inStock: z.coerce.number().int().min(0).default(0),
});

export const storeConfigSchema = z.object({
  companyName: z.string().min(2),
  logoText: z.string().min(1),
  about: z.string().optional().default(""),
  address: z.string().optional().default(""),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional().default(""),
  socialLinks: z
    .object({
      instagram: z.string().optional().default(""),
      facebook: z.string().optional().default(""),
      x: z.string().optional().default(""),
      youtube: z.string().optional().default(""),
    })
    .default({ instagram: "", facebook: "", x: "", youtube: "" }),
  theme: z
    .object({
      layout: z.enum(THEME_LAYOUTS).default(DEFAULT_THEME_LAYOUT),
      primary: z.string().default("#0f172a"),
      accent: z.string().default("#14b8a6"),
      heroImage: z.string().url().or(z.literal("")).default(""),
      sliderImages: z.array(z.string().url()).default([]),
      theme3: z
        .object({
          announcementText: z.string().default("Free Shipping On Orders Over $200"),
          collectionLabels: z.array(z.string().min(1)).default([]),
          collectionLabelImages: z.array(z.string().url()).default([]),
          featuredHeading: z.string().default("Sparkling New Pieces"),
        })
        .default({
          announcementText: "Free Shipping On Orders Over $200",
          collectionLabels: ["Rings", "Bracelets", "Necklaces", "Earrings", "Pendants", "Bangles"],
          collectionLabelImages: [],
          featuredHeading: "Sparkling New Pieces",
        }),
    })
    .default({
      layout: DEFAULT_THEME_LAYOUT,
      primary: "#0f172a",
      accent: "#14b8a6",
      heroImage: "",
      sliderImages: [],
      theme3: {
        announcementText: "Free Shipping On Orders Over $200",
        collectionLabels: ["Rings", "Bracelets", "Necklaces", "Earrings", "Pendants", "Bangles"],
        collectionLabelImages: [],
        featuredHeading: "Sparkling New Pieces",
      },
    }),
  footerLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      })
    )
    .default([]),
});

export const updateStoreStatusSchema = z.object({
  storeId: z.string().min(1),
  status: z.enum(["active", "inactive"]),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(8),
  shippingAddress: z.string().min(6),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().min(1),
    })
  ),
});
