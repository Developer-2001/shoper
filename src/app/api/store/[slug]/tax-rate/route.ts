import { NextRequest, NextResponse } from "next/server";

import { getEstimatedSalesTaxRate } from "@/lib/sales-tax";

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") || "";
  const countryCode = request.nextUrl.searchParams.get("countryCode") || "";
  const state = request.nextUrl.searchParams.get("state") || "";
  const stateCode = request.nextUrl.searchParams.get("stateCode") || "";

  const tax = await getEstimatedSalesTaxRate({
    country,
    countryCode,
    state,
    stateCode,
  });

  return NextResponse.json({ tax });
}
