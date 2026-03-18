import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { StoreModel } from "@/models/Store";
import { ProductModel } from "@/models/Product";
import { CustomerModel } from "@/models/Customer";
import { OrderModel } from "@/models/Order";
import { errorResponse, successResponse } from "@/lib/response";
import { checkoutSchema } from "@/lib/validators";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, context: Params) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid checkout payload", 422, parsed.error.flatten());
    }

    await connectDB();

    const store = await StoreModel.findOne({ slug: slug.toLowerCase() });
    if (!store) {
      return errorResponse("Store not found", 404);
    }

    const items = parsed.data.items;

    if (!items.every((item) => Types.ObjectId.isValid(item.productId))) {
      return errorResponse("Invalid product ids in cart", 400);
    }

    const productIds = items.map((item) => new Types.ObjectId(item.productId));

    const products = await ProductModel.find({
      _id: { $in: productIds },
      storeId: store._id,
      isActive: true,
    }).lean();

    if (products.length !== items.length) {
      return errorResponse("Some products are unavailable", 400);
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("Product mismatch found");
      }

      const discountedPrice = product.price - product.price * (product.discount / 100);

      return {
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: discountedPrice,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const { customer, shippingAddress } = parsed.data;

    let customerDoc = await CustomerModel.findOne({
      storeId: store._id,
      $or: [{ email: customer.email.toLowerCase() }, { mobile: customer.mobile }],
    });

    const fullAddress = [
      shippingAddress.line1,
      shippingAddress.line2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.pincode,
      shippingAddress.country,
    ]
      .filter(Boolean)
      .join(", ");

    if (!customerDoc) {
      customerDoc = await CustomerModel.create({
        storeId: store._id,
        name: customer.name,
        email: customer.email.toLowerCase(),
        mobile: customer.mobile,
        address: fullAddress,
        passwordHash: "guest-checkout",
      });
    } else {
      customerDoc.name = customer.name;
      customerDoc.email = customer.email.toLowerCase();
      customerDoc.mobile = customer.mobile;
      customerDoc.address = fullAddress;
      await customerDoc.save();
    }

    const order = await OrderModel.create({
      storeId: store._id,
      customerId: customerDoc._id,
      status: "confirmed",
      totalAmount,
      shippingAddress: fullAddress,
      items: orderItems,
    });

    return successResponse(
      {
        order: {
          _id: String(order._id),
          status: order.status,
          totalAmount: order.totalAmount,
        },
      },
      201,
    );
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Checkout failed", 500);
  }
}
