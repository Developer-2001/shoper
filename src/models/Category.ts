import { model, models, Schema, type Types } from "mongoose";

export type CategoryDocument = {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  normalizedName: string;
};

const CategorySchema = new Schema<CategoryDocument>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

CategorySchema.index({ storeId: 1, normalizedName: 1 }, { unique: true });

export const Category =
  models.Category || model<CategoryDocument>("Category", CategorySchema);
