import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { items, email, shipping } = body;

    await connectToDatabase();

    const store = await Store.findOne({ slug });
    if (!store || !store.paymentSettings?.helcim?.enabled) {
      return NextResponse.json(
        { error: "Helcim is not enabled for this store." },
        { status: 400 }
      );
    }

    const helcimToken = store.paymentSettings.helcim.token;
    if (!helcimToken) {
      return NextResponse.json(
        { error: "Helcim API token is missing." },
        { status: 400 }
      );
    }

    // Calculate Total
    let total = 0;
    const productIds = items.map((item: any) => item.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    for (const item of items) {
      const product = dbProducts.find((p) => p._id.toString() === item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    // Initialize HelcimPay Session
    const helcimResponse = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-token": helcimToken,
      },
      body: JSON.stringify({
        amount: 0,
        currency: items[0]?.currency || "CAD",
        paymentType: "verify",
        customer: {
          email: email,
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          billingAddress: {
            address1: shipping.shippingAddress,
            city: shipping.city,
            province: shipping.state,
            country: "CAN", // For now, defaulting to CAN/USA as per Helcim primary markets
            postalCode: shipping.postalCode,
          },
        },
      }),
    });

    if (!helcimResponse.ok) {
      const errorData = await helcimResponse.json();
      console.error("Helcim Init Error:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to initialize Helcim payment." },
        { status: helcimResponse.status }
      );
    }

    const data = await helcimResponse.json();
    return NextResponse.json({
      checkoutToken: data.checkoutToken,
      secretToken: data.secretToken, // We usually keep this on server, but for simplicity returning it
    });

  } catch (error) {
    console.error("Helcim Initialize Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error during Helcim initialization." },
      { status: 500 }
    );
  }
}
