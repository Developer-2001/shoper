import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { checkoutSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const body = await request.json();
    const { ...checkoutData } = body;

    const store = await Store.findOne({ slug }).lean();
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (!store.paymentSettings?.stripe?.enabled) {
      return NextResponse.json({ error: `Stripe is not enabled for this store` }, { status: 400 });
    }

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

    const items = parsed.data.items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        price_data: {
          currencyCode: product.currency,
          unitAmount: product.price,
          name: product.name,
          images: product.images,
        },
        quantity: item.quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price_data.unitAmount * item.quantity, 0);
    const taxPercentage = 3; // Default from model
    const taxAmount = (subtotal * taxPercentage) / 100;
    const shippingCharge = 0;
    const total = subtotal + taxAmount + shippingCharge;
    const itemCount = parsed.data.items.reduce((sum, item) => sum + item.quantity, 0);
    const orderNumber = `ORD-${Date.now().toString().slice(-7)}`;

    // Create a pending order
    await Order.create({
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
      paymentProvider: "stripe",
      paymentId: "",
    });

    const lineItems = [
      ...items.map((item) => ({
        price_data: {
          currency: item.price_data.currencyCode.toLowerCase(),
          product_data: {
            name: item.price_data.name,
            images: item.price_data.images,
          },
          unit_amount: Math.round(item.price_data.unitAmount * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      })),
    ];

    // Add tax if any
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: (products[0].currency || "CAD").toLowerCase(),
          product_data: {
            name: `Tax (${taxPercentage}%)`,
          },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      } as any);
    }

    // Add shipping if any
    if (shippingCharge > 0) {
      lineItems.push({
        price_data: {
          currency: (products[0].currency || "CAD").toLowerCase(),
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shippingCharge * 100),
        },
        quantity: 1,
      } as any);
    }

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}/checkout/cancel`,
        client_reference_id: orderNumber, // Link Stripe to our Order Number
        metadata: {
          orderNumber,
          slug,
        },
      },
      {
        stripeAccount: store.paymentSettings.stripe.accountId,
      }
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Payment session creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment session" }, { status: 500 });
  }
}
