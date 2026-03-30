import { model, models, Schema, type Types } from "mongoose";

export type OrderDocument = {
  _id: Types.ObjectId;
  storeId: Types.ObjectId;
  orderNumber: string;
  items: {
    productId: Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
    currency: string;
  }[];
  customer: {
    customerName: string;
    email: string;
    mobile: string;
  };
  shipping: {
    shippingAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  subtotal: number;
  status: "confirmed" | "packed" | "shipped" | "delivered";
  paymentStatus: "unpaid" | "paid" | "failed";
  paymentProvider: "stripe" | "none";
  paymentId: string;
};

const OrderSchema = new Schema<OrderDocument>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        currency: { type: String, required: true },
      },
    ],
    customer: {
      customerName: { type: String, required: true },
      email: { type: String, required: true },
      mobile: { type: String, required: true },
    },
    shipping: {
      shippingAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "packed", "shipped", "delivered"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
    paymentProvider: {
      type: String,
      enum: ["stripe", "none"],
      default: "none",
    },
    paymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Order = models.Order || model<OrderDocument>("Order", OrderSchema);
