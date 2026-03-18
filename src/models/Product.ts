import { model, models, Schema, type Types } from "mongoose";

export type ProductDocument = {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  category: string;
  discountPercentage: number;
  inStock: number;
  isPublished: boolean;
};

const ProductSchema = new Schema<ProductDocument>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    images: { type: [String], required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    category: { type: String, required: true },
    discountPercentage: { type: Number, default: 0 },
    inStock: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = models.Product || model<ProductDocument>("Product", ProductSchema);
