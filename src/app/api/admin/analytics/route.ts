import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/api-auth";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";

type RangeKey = "daily" | "weekly" | "monthly" | "6month" | "yearly";
type BucketUnit = "hour" | "day" | "month";

type ResolvedRange = {
  key: RangeKey;
  bucket: BucketUnit;
  start: Date;
  end: Date;
  label: string;
  isCustom: boolean;
};

type TrendAggregate = {
  _id: string;
  orders: number;
  revenue: number;
  paidRevenue: number;
  items: number;
};

type SummaryAggregate = {
  _id: null;
  orders: number;
  revenue: number;
  paidRevenue: number;
  itemsSold: number;
  averageOrderValue: number;
};

type PaymentAggregate = {
  _id: string;
  count: number;
  amount: number;
};

type StatusAggregate = {
  _id: string;
  count: number;
};

type TopProductAggregate = {
  _id: Types.ObjectId;
  name: string;
  quantity: number;
  revenue: number;
};

type CategoryAggregate = {
  _id: string;
  quantity: number;
  revenue: number;
  orderSet: Types.ObjectId[];
};

type OrderMatch = {
  storeId: Types.ObjectId;
  createdAt: {
    $gte: Date;
    $lte?: Date;
    $lt?: Date;
  };
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_KEYS: RangeKey[] = [
  "daily",
  "weekly",
  "monthly",
  "6month",
  "yearly",
];

function toSafeNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function round(value: number, digits = 2) {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }
  return round(((current - previous) / previous) * 100, 1);
}

function startOfHour(date: Date) {
  const clone = new Date(date);
  clone.setUTCMinutes(0, 0, 0);
  return clone;
}

function startOfDay(date: Date) {
  const clone = new Date(date);
  clone.setUTCHours(0, 0, 0, 0);
  return clone;
}

function endOfDay(date: Date) {
  const clone = new Date(date);
  clone.setUTCHours(23, 59, 59, 999);
  return clone;
}

function startOfMonth(date: Date) {
  const clone = new Date(date);
  clone.setUTCDate(1);
  clone.setUTCHours(0, 0, 0, 0);
  return clone;
}

function parseDateValue(raw: string, mode: "start" | "end") {
  const hasTime = raw.includes("T");
  const normalized = hasTime
    ? raw
    : `${raw}${mode === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"}`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function toPresetRange(rangeKey: RangeKey, now: Date): ResolvedRange {
  if (rangeKey === "daily") {
    const end = now;
    const start = startOfHour(new Date(now.getTime() - 23 * 60 * 60 * 1000));
    return {
      key: rangeKey,
      bucket: "hour",
      start,
      end,
      label: "Last 24 hours",
      isCustom: false,
    };
  }

  if (rangeKey === "weekly") {
    const end = now;
    const start = startOfDay(new Date(now.getTime() - 6 * DAY_MS));
    return {
      key: rangeKey,
      bucket: "day",
      start,
      end,
      label: "Last 7 days",
      isCustom: false,
    };
  }

  if (rangeKey === "monthly") {
    const end = now;
    const start = startOfDay(new Date(now.getTime() - 29 * DAY_MS));
    return {
      key: rangeKey,
      bucket: "day",
      start,
      end,
      label: "Last 30 days",
      isCustom: false,
    };
  }

  if (rangeKey === "6month") {
    const end = now;
    const start = startOfMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)));
    return {
      key: rangeKey,
      bucket: "month",
      start,
      end,
      label: "Last 6 months",
      isCustom: false,
    };
  }

  const end = now;
  const start = startOfMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)));
  return {
    key: "yearly",
    bucket: "month",
    start,
    end,
    label: "Last 12 months",
    isCustom: false,
  };
}

function resolveRange(request: NextRequest): ResolvedRange | { error: string } {
  const searchParams = request.nextUrl.searchParams;
  const rawRange = searchParams.get("range") || "monthly";
  const rangeKey: RangeKey = RANGE_KEYS.includes(rawRange as RangeKey)
    ? (rawRange as RangeKey)
    : "monthly";

  const customStartRaw = searchParams.get("start");
  const customEndRaw = searchParams.get("end");
  const now = new Date();

  if (!customStartRaw || !customEndRaw) {
    return toPresetRange(rangeKey, now);
  }

  const start = parseDateValue(customStartRaw, "start");
  const end = parseDateValue(customEndRaw, "end");

  if (!start || !end) {
    return { error: "Invalid custom date range." };
  }

  if (end < start) {
    return { error: "End date must be after start date." };
  }

  const durationMs = end.getTime() - start.getTime();
  const bucket: BucketUnit =
    durationMs <= 2 * DAY_MS ? "hour" : durationMs <= 120 * DAY_MS ? "day" : "month";

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return {
    key: rangeKey,
    bucket,
    start,
    end,
    label: `${formatter.format(start)} - ${formatter.format(end)}`,
    isCustom: true,
  };
}

function getGroupDateFormat(bucket: BucketUnit) {
  if (bucket === "hour") return "%Y-%m-%dT%H:00:00Z";
  if (bucket === "day") return "%Y-%m-%d";
  return "%Y-%m";
}

function toBucketKey(date: Date, bucket: BucketUnit) {
  if (bucket === "hour") {
    return `${date.toISOString().slice(0, 13)}:00:00Z`;
  }
  if (bucket === "day") {
    return date.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 7);
}

function bucketStart(date: Date, bucket: BucketUnit) {
  if (bucket === "hour") return startOfHour(date);
  if (bucket === "day") return startOfDay(date);
  return startOfMonth(date);
}

function addBucket(date: Date, bucket: BucketUnit) {
  const clone = new Date(date);
  if (bucket === "hour") {
    clone.setUTCHours(clone.getUTCHours() + 1);
    return clone;
  }
  if (bucket === "day") {
    clone.setUTCDate(clone.getUTCDate() + 1);
    return clone;
  }
  clone.setUTCMonth(clone.getUTCMonth() + 1);
  return clone;
}

function parseBucketDate(key: string, bucket: BucketUnit) {
  if (bucket === "hour") return new Date(key);
  if (bucket === "day") return new Date(`${key}T00:00:00.000Z`);
  return new Date(`${key}-01T00:00:00.000Z`);
}

function formatBucketLabel(date: Date, bucket: BucketUnit) {
  if (bucket === "hour") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(date);
  }
  if (bucket === "day") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function buildSeries(
  start: Date,
  end: Date,
  bucket: BucketUnit,
  trendRows: TrendAggregate[],
) {
  const trendMap = new Map(
    trendRows.map((row) => [
      row._id,
      {
        orders: toSafeNumber(row.orders),
        revenue: toSafeNumber(row.revenue),
        paidRevenue: toSafeNumber(row.paidRevenue),
        items: toSafeNumber(row.items),
      },
    ]),
  );

  const points: {
    key: string;
    label: string;
    revenue: number;
    paidRevenue: number;
    orders: number;
    items: number;
  }[] = [];

  let cursor = bucketStart(start, bucket);
  const finish = bucketStart(end, bucket);

  while (cursor.getTime() <= finish.getTime()) {
    const key = toBucketKey(cursor, bucket);
    const found = trendMap.get(key) || {
      revenue: 0,
      paidRevenue: 0,
      orders: 0,
      items: 0,
    };

    points.push({
      key,
      label: formatBucketLabel(parseBucketDate(key, bucket), bucket),
      revenue: round(found.revenue),
      paidRevenue: round(found.paidRevenue),
      orders: Math.round(found.orders),
      items: Math.round(found.items),
    });

    cursor = addBucket(cursor, bucket);
  }

  return points;
}

async function loadSummary(match: OrderMatch) {
  const [summaryRow] = await Order.aggregate<SummaryAggregate>([
    { $match: match },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        revenue: { $sum: "$total" },
        paidRevenue: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
          },
        },
        itemsSold: { $sum: "$itemCount" },
        averageOrderValue: { $avg: "$total" },
      },
    },
  ]);

  const distinctCustomers = await Order.distinct("customer.email", {
    ...match,
    "customer.email": { $nin: [null, ""] },
  });

  return {
    orders: toSafeNumber(summaryRow?.orders),
    revenue: round(toSafeNumber(summaryRow?.revenue)),
    paidRevenue: round(toSafeNumber(summaryRow?.paidRevenue)),
    itemsSold: toSafeNumber(summaryRow?.itemsSold),
    averageOrderValue: round(toSafeNumber(summaryRow?.averageOrderValue)),
    customers: distinctCustomers.filter(Boolean).length,
  };
}

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const resolved = resolveRange(request);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }

  const storeId = new Types.ObjectId(auth.payload.storeId);
  const store = await Store.findById(auth.payload.storeId)
    .select("businessName slug currency status")
    .lean();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const match = {
    storeId,
    createdAt: { $gte: resolved.start, $lte: resolved.end },
  };

  const durationMs = Math.max(1, resolved.end.getTime() - resolved.start.getTime() + 1);
  const previousMatch = {
    storeId,
    createdAt: {
      $gte: new Date(resolved.start.getTime() - durationMs),
      $lt: resolved.start,
    },
  };

  const [
    currentSummary,
    previousSummary,
    trendRows,
    paymentBreakdownRaw,
    statusBreakdownRaw,
    topProductsRaw,
    categoryRaw,
    totalProducts,
    publishedProducts,
    outOfStockProducts,
    lowStockProducts,
  ] = await Promise.all([
    loadSummary(match),
    loadSummary(previousMatch),
    Order.aggregate<TrendAggregate>([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$createdAt",
              format: getGroupDateFormat(resolved.bucket),
              timezone: "UTC",
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$total" },
          paidRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0],
            },
          },
          items: { $sum: "$itemCount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate<PaymentAggregate>([
      { $match: match },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          amount: { $sum: "$total" },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate<StatusAggregate>([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate<TopProductAggregate>([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),
    Order.aggregate<CategoryAggregate>([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: Product.collection.name,
          localField: "items.productId",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      {
        $unwind: {
          path: "$productDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$productDoc.category", "Uncategorized"] },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderSet: { $addToSet: "$_id" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),
    Product.countDocuments({ storeId }),
    Product.countDocuments({ storeId, isPublished: true }),
    Product.countDocuments({ storeId, inStock: { $lte: 0 } }),
    Product.countDocuments({ storeId, inStock: { $gt: 0, $lte: 5 } }),
  ]);

  const series = buildSeries(resolved.start, resolved.end, resolved.bucket, trendRows);
  const draftProducts = Math.max(0, totalProducts - publishedProducts);

  const paymentBreakdown = paymentBreakdownRaw.map((row) => ({
    status: row._id || "unpaid",
    count: toSafeNumber(row.count),
    amount: round(toSafeNumber(row.amount)),
  }));

  const statusBreakdown = statusBreakdownRaw.map((row) => ({
    status: row._id || "confirmed",
    count: toSafeNumber(row.count),
  }));

  const topProducts = topProductsRaw.map((row) => ({
    productId: row._id?.toString?.() || "",
    name: row.name || "Unnamed product",
    quantity: toSafeNumber(row.quantity),
    revenue: round(toSafeNumber(row.revenue)),
  }));

  const categoryPerformance = categoryRaw.map((row) => ({
    category: row._id || "Uncategorized",
    quantity: toSafeNumber(row.quantity),
    revenue: round(toSafeNumber(row.revenue)),
    orders: Array.isArray(row.orderSet) ? row.orderSet.length : 0,
  }));

  return NextResponse.json({
    store: {
      businessName: store.businessName,
      slug: store.slug,
      currency: store.currency || "INR",
      status: store.status || "inactive",
    },
    range: {
      key: resolved.key,
      label: resolved.label,
      bucket: resolved.bucket,
      isCustom: resolved.isCustom,
      start: resolved.start.toISOString(),
      end: resolved.end.toISOString(),
    },
    summary: currentSummary,
    changes: {
      revenue: percentChange(currentSummary.revenue, previousSummary.revenue),
      paidRevenue: percentChange(
        currentSummary.paidRevenue,
        previousSummary.paidRevenue,
      ),
      orders: percentChange(currentSummary.orders, previousSummary.orders),
      itemsSold: percentChange(currentSummary.itemsSold, previousSummary.itemsSold),
      averageOrderValue: percentChange(
        currentSummary.averageOrderValue,
        previousSummary.averageOrderValue,
      ),
      customers: percentChange(currentSummary.customers, previousSummary.customers),
    },
    inventory: {
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
    },
    series,
    paymentBreakdown,
    statusBreakdown,
    topProducts,
    categoryPerformance,
  });
}
