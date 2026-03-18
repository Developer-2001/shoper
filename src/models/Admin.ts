import { model, models, Schema, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    ownerName: { type: String, required: true },
    businessEmail: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true },
    businessName: { type: String, required: true },
    currency: { type: String, required: true, default: "INR" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export type AdminDocument = InferSchemaType<typeof adminSchema>;

export const AdminModel = models.Admin || model("Admin", adminSchema);
