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

export const updateAdminProfileSchema = z.object({
  ownerName: z.string().min(2),
  businessName: z.string().min(2),
});

export const changeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  images: z.array(z.string().url()).min(1),
  price: z.coerce.number().min(0.5, "Price must be at least 0.50"),
  currency: z.string().min(1),
  category: z.string().min(2),
  discountPercentage: z.coerce.number().min(0).max(90).default(0),
  inStock: z.coerce.number().int().min(0).default(0),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
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
    })
    .default({
      layout: DEFAULT_THEME_LAYOUT,
    }),
  footerLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      })
    )
    .default([]),
  paymentSettings: z
    .object({
      stripe: z
        .object({
          enabled: z.boolean().default(false),
          accountId: z.string().default(""),
        })
        .default({ enabled: false, accountId: "" }),
    })
    .optional()
    .default({
      stripe: { enabled: false, accountId: "" },
    }),
});

export const updateStoreStatusSchema = z.object({
  storeId: z.string().min(1),
  status: z.enum(["active", "inactive"]),
});

const checkoutItemsSchema = z.array(
  z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1),
  })
);

const checkoutAddressSchema = z.object({
  country: z.string().min(2),
  countryCode: z.string().optional().default(""),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  shippingAddress: z.string().min(6),
  city: z.string().min(2),
  state: z.string().min(2),
  stateCode: z.string().optional().default(""),
  postalCode: z.string().min(3),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  shipping: checkoutAddressSchema,
  useShippingAsBilling: z.boolean().default(true),
  billing: checkoutAddressSchema.optional(),
  cartNote: z.string().optional().default(""),
  discountCode: z.string().optional().default(""),
  items: checkoutItemsSchema,
});
