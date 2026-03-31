import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("account_id");

  if (!accountId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/configure-store?stripe_success=false&error=no_account_id`);
  }

  try {
    await connectToDatabase();

    // Fetch account details from Stripe to verify status
    const account = await stripe.accounts.retrieve(accountId);

    if (account.details_submitted) {
      // Find the store with this account ID and enable it
      const store = await Store.findOneAndUpdate(
        { "paymentSettings.stripe.accountId": accountId },
        {
          $set: { "paymentSettings.stripe.enabled": true }
        },
        { new: true }
      );

      if (!store) {
        console.warn(`Stripe callback: Store with account id ${accountId} not found in DB`);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/configure-store?stripe_success=false&error=store_not_found`);
      }


      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/configure-store?stripe_success=true`);
    } else {
      console.warn(`Stripe callback: Account ${accountId} details not submitted yet`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/configure-store?stripe_success=false&error=details_not_submitted`);
    }
  } catch (error: any) {
    console.error("Stripe callback failed:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/admin/configure-store?stripe_success=false&error=${encodeURIComponent(error.message)}`);
  }
}
