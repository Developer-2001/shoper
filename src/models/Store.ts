import { model, models, Schema, type InferSchemaType } from "mongoose";

const storeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true },
    businessEmail: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true },
    currency: { type: String, required: true, default: "INR" },
    logo: { type: String, default: "" },
    address: { type: String, default: "" },
    about: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactMobile: { type: String, default: "" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      x: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    homeContent: {
      heroTitle: { type: String, default: "Sell smarter with your custom storefront" },
      heroSubtitle: {
        type: String,
        default: "Launch your jewellery, watches, and eyewear business with a powerful admin dashboard.",
      },
      sliderImages: {
        type: [String],
        default: [
          "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      ctaText: { type: String, default: "Shop Now" },
    },
    theme: {
      primaryColor: { type: String, default: "#0f172a" },
      secondaryColor: { type: String, default: "#f59e0b" },
      accentColor: { type: String, default: "#0ea5e9" },
    },
  },
  { timestamps: true },
);

export type StoreDocument = InferSchemaType<typeof storeSchema>;

export const StoreModel = models.Store || model("Store", storeSchema);
