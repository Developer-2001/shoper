import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { Order } from "@/models/Order";

export async function GET() {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const orders = await Order.find({ storeId: auth.payload.storeId }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ orders });
}
