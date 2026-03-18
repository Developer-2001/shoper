import { model, models, Schema, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true, default: [] },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    category: { type: String, required: true },
    discount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const ProductModel = models.Product || model("Product", productSchema);
