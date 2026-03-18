import { model, models, Schema, type Types } from "mongoose";

export type AdminUserDocument = {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  email: string;
  mobile: string;
  ownerName: string;
  passwordHash: string;
};

const AdminUserSchema = new Schema<AdminUserDocument>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminUser =
  models.AdminUser || model<AdminUserDocument>("AdminUser", AdminUserSchema);
