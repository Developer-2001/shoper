import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/api-auth";
import { Store } from "@/models/Store";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const store = await Store.findById(auth.payload.storeId);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    let accountId = store.paymentSettings?.stripe?.accountId;

    if (!accountId) {
      // Create a Standard account for the store owner
      const account = await stripe.accounts.create({
        type: "standard",
        email: store.businessEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          storeId: store._id.toString(),
          slug: store.slug,
        },
      });
      accountId = account.id;

      // Save the account ID to the store record
      store.paymentSettings = {
        ...store.paymentSettings,
        stripe: {
          enabled: false, // Will be enabled after successful callback
          accountId,
        },
      };
      await store.save();
    }

    // Create the onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/configure-store?stripe_error=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/stripe/callback?account_id=${accountId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe onboarding initiation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start Stripe onboarding" },
      { status: 500 }
    );
  }
}
