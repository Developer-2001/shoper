import { model, models, Schema, type InferSchemaType } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const OrderModel = models.Order || model("Order", orderSchema);
