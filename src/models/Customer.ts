import { model, models, Schema, type InferSchemaType } from "mongoose";

const customerSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

customerSchema.index({ storeId: 1, email: 1 }, { unique: true });
customerSchema.index({ storeId: 1, mobile: 1 }, { unique: true });

export type CustomerDocument = InferSchemaType<typeof customerSchema>;

export const CustomerModel = models.Customer || model("Customer", customerSchema);
