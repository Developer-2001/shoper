import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { checkoutSchema } from "@/lib/validations";
import { Store } from "@/models/store";
import { Product } from "@/models/product";
import { Order } from "@/models/order";

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-7);
  const random = Math.floor(Math.random() * 900 + 100);
  return `ORD-${stamp}${random}`;
}

type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  currency: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connectToDatabase();

  const routeParams = await params;
  const store = await Store.findOne({ slug: routeParams.slug }).lean();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ids = parsed.data.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids }, storeId: store._id }).lean();

  if (!products.length) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  const items = parsed.data.items.reduce<OrderItem[]>((acc, item) => {
    const product = products.find((entry) => entry._id.toString() === item.productId);
    if (!product) return acc;

    acc.push({
      productId: product._id.toString(),
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: item.quantity,
      currency: product.currency,
    });

    return acc;
  }, []);

  if (!items.length) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    storeId: store._id,
    orderNumber: createOrderNumber(),
    items,
    customer: {
      customerName: parsed.data.customerName,
      email: parsed.data.email,
      mobile: parsed.data.mobile,
    },
    shipping: {
      shippingAddress: parsed.data.shippingAddress,
      city: parsed.data.city,
      state: parsed.data.state,
      postalCode: parsed.data.postalCode,
    },
    subtotal,
    status: "confirmed",
  });

  return NextResponse.json({ order }, { status: 201 });
}
