import { z } from "zod";
import { PRODUCT_CATEGORIES, SUPPORTED_CURRENCIES } from "@/lib/constants";

const emailField = z.string().email("Enter a valid email address");
const mobileField = z
  .string()
  .min(8, "Mobile should be minimum 8 digits")
  .max(15, "Mobile should be maximum 15 digits");

export const adminSignupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessEmail: emailField,
  mobile: mobileField,
  ownerName: z.string().min(2, "Owner name is required"),
  currency: z.enum(SUPPORTED_CURRENCIES),
  password: z.string().min(6, "Password should be at least 6 characters"),
});

export const adminLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(5, "Description is required"),
  images: z.array(z.string().url("Each image must be a valid URL")).min(1),
  price: z.coerce.number().positive("Price should be greater than 0"),
  currency: z.enum(SUPPORTED_CURRENCIES),
  category: z.enum(PRODUCT_CATEGORIES),
  discount: z.coerce.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
});

export const storeConfigSchema = z.object({
  logo: z.string().url("Enter a valid logo URL").or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  about: z.string().min(10, "About is required"),
  contactEmail: emailField,
  contactMobile: mobileField,
  socialLinks: z.object({
    instagram: z.string().url().or(z.literal("")),
    facebook: z.string().url().or(z.literal("")),
    x: z.string().url().or(z.literal("")),
    youtube: z.string().url().or(z.literal("")),
  }),
  homeContent: z.object({
    heroTitle: z.string().min(3, "Hero title is required"),
    heroSubtitle: z.string().min(10, "Hero subtitle is required"),
    sliderImages: z.array(z.string().url()).max(5),
    ctaText: z.string().min(2, "CTA text is required"),
  }),
  theme: z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/),
    accentColor: z.string().regex(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/),
  }),
});

export const adminProfileSchema = z.object({
  ownerName: z.string().min(2),
  mobile: mobileField,
  businessEmail: emailField,
});

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Name is required"),
    email: emailField,
    mobile: mobileField,
  }),
  shippingAddress: z.object({
    line1: z.string().min(4, "Address line 1 is required"),
    line2: z.string().optional().default(""),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(4, "Pincode is required"),
    country: z.string().min(2, "Country is required"),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1, "Cart cannot be empty"),
});
