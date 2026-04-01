import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { checkoutSchema } from "@/lib/validations";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { getEstimatedSalesTaxRate } from "@/lib/sales-tax";

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-7);
  const random = Math.floor(Math.random() * 900 + 100);
  return `ORD-${stamp}${random}`;
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

const ORDER_DISCOUNT_CODES: Record<
  string,
  { code: string; percent: number }
> = {
  deva123: { code: "Deva123", percent: 20 },
  vinayak123: { code: "Vinayak123", percent: 30 },
};

type AddressPayload = {
  country: string;
  countryCode?: string;
  firstName: string;
  lastName: string;
  shippingAddress: string;
  city: string;
  state: string;
  stateCode?: string;
  postalCode: string;
};

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
  try {
    await connectToDatabase();

    const routeParams = await params;
    const store = await Store.findOne({ slug: routeParams.slug }).lean();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (store.status === "inactive") {
      return NextResponse.json({ error: "Store is inactive" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const shipping: AddressPayload = payload.shipping;
    const useShippingAsBilling = payload.useShippingAsBilling ?? true;
    const billing: AddressPayload =
      useShippingAsBilling || !payload.billing ? payload.shipping : payload.billing;
    const customerEmail = payload.email;
    const cartNote = payload.cartNote || "";
    const requestedDiscountCode = payload.discountCode || "";

    const ids = payload.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: ids }, storeId: store._id }).lean();

    if (!products.length) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    const items = payload.items.reduce<OrderItem[]>((acc, item) => {
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
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const normalizedDiscountCode = requestedDiscountCode.trim().toLowerCase();
    const matchedDiscount = ORDER_DISCOUNT_CODES[normalizedDiscountCode];
    const discountCode = matchedDiscount?.code ?? "";
    const discountPercentage = matchedDiscount?.percent ?? 0;
    const discountAmount = roundPrice((subtotal * discountPercentage) / 100);
    const shippingCharge = 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxInfo = await getEstimatedSalesTaxRate({
      country: shipping.country,
      countryCode: shipping.countryCode,
      state: shipping.state,
      stateCode: shipping.stateCode,
    });
    const taxPercentage = taxInfo.ratePercent;
    const taxAmount = roundPrice((taxableAmount * taxPercentage) / 100);
    const total = roundPrice(taxableAmount + shippingCharge + taxAmount);
    const currency = items[0]?.currency || "INR";

    let order = null;
    let attempts = 0;
    while (!order && attempts < 3) {
      attempts += 1;
      try {
        order = await Order.create({
          storeId: store._id,
          orderNumber: createOrderNumber(),
          items,
          customer: {
            firstName: shipping.firstName,
            lastName: shipping.lastName,
            email: customerEmail,
          },
          shipping,
          billing,
          useShippingAsBilling,
          cartNote,
          discountCode,
          discountPercentage,
          discountAmount,
          itemCount,
          shippingCharge,
          taxPercentage,
          taxAmount,
          subtotal,
          total,
          currency,
          status: "confirmed",
        });
      } catch (createError: unknown) {
        if (
          typeof createError === "object" &&
          createError !== null &&
          "code" in createError &&
          (createError as { code?: number }).code === 11000
        ) {
          continue;
        }
        throw createError;
      }
    }

    if (!order) {
      return NextResponse.json(
        { error: "Could not generate unique order number. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: unknown) {
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: string }).message === "string"
        ? (error as { message: string }).message
        : "Failed to place order.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
