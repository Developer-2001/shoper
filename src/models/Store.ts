import { model, models, Schema, type Types } from "mongoose";

export type StoreDocument = {
  _id: Types.ObjectId;
  businessName: string;
  businessEmail: string;
  mobile: string;
  ownerName: string;
  currency: string;
  slug: string;
  about: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logoText: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
  };
  theme: {
    primary: string;
    accent: string;
    heroImage: string;
    sliderImages: string[];
  };
  footerLinks: { label: string; href: string }[];
};

const StoreSchema = new Schema<StoreDocument>(
  {
    businessName: { type: String, required: true },
    businessEmail: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    currency: { type: String, required: true, default: "INR" },
    slug: { type: String, required: true, unique: true, index: true },
    about: { type: String, default: "" },
    address: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    logoText: { type: String, default: "Shoper Store" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      x: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    theme: {
      primary: { type: String, default: "#0f172a" },
      accent: { type: String, default: "#14b8a6" },
      heroImage: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
      },
      sliderImages: { type: [String], default: [] },
    },
    footerLinks: {
      type: [{ label: String, href: String }],
      default: [],
    },
  },
  { timestamps: true }
);

export const Store = models.Store || model<StoreDocument>("Store", StoreSchema);
