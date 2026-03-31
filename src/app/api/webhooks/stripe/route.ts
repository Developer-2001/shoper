import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function createOrderNumber() {
  const stamp = Date.now().toString().slice(-7);
  const random = Math.floor(Math.random() * 900 + 100);
  return `ORD-${stamp}${random}`;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    console.log(`✅ Webhook received: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { metadata } = session;

    console.log(`📦 Processing session: ${session.id}`, { metadata });

    if (!metadata || !metadata.orderNumber) {
      console.error("❌ Metadata or orderNumber missing in Stripe session");
      return NextResponse.json({ error: "Metadata missing" }, { status: 400 });
    }

    try {
      await connectToDatabase();

      const orderNumber = metadata.orderNumber;

      const order = await Order.findOneAndUpdate(
        { orderNumber },
        {
          paymentStatus: "paid",
          paymentProvider: "stripe",
          paymentId: session.id,
          paymentDetails: session,
        },
        { new: true }
      );

      if (!order) {
        console.error(`Order ${orderNumber} not found for Stripe session ${session.id}`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

    } catch (err: any) {
      console.error(`Error creating order from Stripe webhook: ${err.message}`);
      return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
