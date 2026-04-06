import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { checkoutSchema } from "@/lib/validations";
import { getEstimatedSalesTaxRate } from "@/lib/sales-tax";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const body = await request.json();
    const { cardToken, ...checkoutData } = body;

    if (!cardToken) {
      return NextResponse.json({ error: "Missing payment token" }, { status: 400 });
    }

    const store = await Store.findOne({ slug }).lean();
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (!store.paymentSettings?.helcim?.enabled) {
      return NextResponse.json({ error: "Helcim is not enabled for this store" }, { status: 400 });
    }

    const { accountId, token: apiToken } = store.paymentSettings.helcim;

    const parsed = checkoutSchema.safeParse(checkoutData);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Load products to get real prices and names
    const ids = parsed.data.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: ids }, storeId: store._id }).lean();

    if (!products.length) {
      return NextResponse.json({ error: "No items to purchase" }, { status: 400 });
    }

    const subtotal = parsed.data.items.reduce((sum, item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const taxInfo = await getEstimatedSalesTaxRate({
      country: parsed.data.shipping.country,
      countryCode: parsed.data.shipping.countryCode,
      state: parsed.data.shipping.state,
      stateCode: parsed.data.shipping.stateCode,
    });
    
    const taxPercentage = taxInfo.ratePercent;
    const taxAmount = (subtotal * taxPercentage) / 100;
    const shippingCharge = 0;
    const total = subtotal + taxAmount + shippingCharge;
    const itemCount = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
    const orderNumber = `ORD-H-${Date.now().toString().slice(-7)}`;

    // Create a pending order
    const order = await Order.create({
      storeId: store._id,
      orderNumber,
      items: parsed.data.items.map((item) => {
        const product = products.find((p) => p._id.toString() === item.productId);
        return {
          productId: item.productId,
          name: product?.name || "Unknown",
          image: product?.images?.[0] || "",
          price: product?.price || 0,
          quantity: item.quantity,
          currency: product?.currency || "CAD",
        };
      }),
      customer: {
        firstName: parsed.data.shipping.firstName,
        lastName: parsed.data.shipping.lastName,
        email: parsed.data.email,
      },
      shipping: parsed.data.shipping,
      billing: parsed.data.billing || parsed.data.shipping,
      useShippingAsBilling: parsed.data.useShippingAsBilling,
      cartNote: parsed.data.cartNote,
      discountCode: parsed.data.discountCode,
      itemCount,
      shippingCharge,
      taxPercentage,
      taxAmount,
      subtotal,
      total,
      currency: products[0].currency || "CAD",
      status: "confirmed",
      paymentStatus: "unpaid",
      paymentProvider: "helcim",
      paymentId: "",
    });

    // Process payment with Helcim API
    const helcimResponse = await fetch("https://api.helcim.com/v2/payment/purchase", {
      method: "POST",
      headers: {
        "api-token": apiToken,
        "account-id": accountId, // Required for some Helcim endpoints
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(total.toFixed(2)),
        currency: products[0].currency || "CAD",
        cardToken: cardToken,
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        ecommerce: true,
        orderNumber: orderNumber,
      }),
    });

    const helcimData = await helcimResponse.json();

    if (!helcimResponse.ok || helcimData.status === "REJECTED" || helcimData.status === "DECLINED") {
      // Update order status to failed
      await Order.findByIdAndUpdate(order._id, { 
        paymentStatus: "failed",
        paymentId: helcimData.transactionId || ""
      });
      return NextResponse.json({ 
        error: helcimData.errors || helcimData.message || "Payment declined by Helcim." 
      }, { status: 400 });
    }

    // Success! Update order
    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: "paid",
      paymentId: String(helcimData.transactionId || helcimData.id || ""),
    });

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: any) {
    console.error("Helcim payment processing failed:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
