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
    firstName: string;
    lastName: string;
    email: string;
  };
  shipping: {
    country: string;
    firstName: string;
    lastName: string;
    shippingAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  billing: {
    country: string;
    firstName: string;
    lastName: string;
    shippingAddress: string;
    city: string;
    state: string;
    postalCode: string;
  };
  useShippingAsBilling: boolean;
  cartNote: string;
  discountCode: string;
  discountPercentage: number;
  discountAmount: number;
  itemCount: number;
  shippingCharge: number;
  taxPercentage: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  currency: string;
  status: "confirmed" | "packed" | "shipped" | "delivered";
  paymentStatus: "unpaid" | "paid" | "failed";
  paymentProvider: "stripe" | "none";
  paymentId: string;
  paymentDetails?: any;
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
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
    },
    shipping: {
      country: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      shippingAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    billing: {
      country: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      shippingAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    useShippingAsBilling: { type: Boolean, default: true },
    cartNote: { type: String, default: "" },
    discountCode: { type: String, default: "" },
    discountPercentage: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    itemCount: { type: Number, required: true },
    shippingCharge: { type: Number, required: true },
    taxPercentage: { type: Number, required: true, default: 3 },
    taxAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
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
    paymentDetails: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

if (models.Order) {
  delete models.Order;
}

export const Order = model<OrderDocument>("Order", OrderSchema);
