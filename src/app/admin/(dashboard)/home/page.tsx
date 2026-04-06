"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Skeleton } from "@/components/admin/ui/skeleton";
import {
  AreaTrendChart,
  BarTrendChart,
  type TrendPoint,
} from "@/components/admin/analytics-charts";
import { formatMoney } from "@/utils/currency";

type RangeKey = "daily" | "weekly" | "monthly" | "6month" | "yearly";

type AnalyticsData = {
  store: {
    businessName: string;
    slug: string;
    currency: string;
    status: "active" | "inactive";
  };
  range: {
    key: RangeKey;
    label: string;
    bucket: "hour" | "day" | "month";
    isCustom: boolean;
    start: string;
    end: string;
  };
  summary: {
    orders: number;
    revenue: number;
    paidRevenue: number;
    itemsSold: number;
    averageOrderValue: number;
    customers: number;
  };
  changes: {
    revenue: number;
    paidRevenue: number;
    orders: number;
    itemsSold: number;
    averageOrderValue: number;
    customers: number;
  };
  inventory: {
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
  };
  series: {
    key: string;
    label: string;
    revenue: number;
    paidRevenue: number;
    orders: number;
    items: number;
  }[];
  paymentBreakdown: {
    status: string;
    count: number;
    amount: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
  }[];
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  categoryPerformance: {
    category: string;
    quantity: number;
    revenue: number;
    orders: number;
  }[];
};

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "6month", label: "6 Months" },
  { key: "yearly", label: "Yearly" },
];

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatChange(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function changeClass(value: number) {
  if (value > 0) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (value < 0) return "text-rose-700 bg-rose-50 border-rose-200";
  return "text-slate-600 bg-slate-50 border-slate-200";
}

function normalizeStatusLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminHomePage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState<RangeKey>("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [queryRange, setQueryRange] = useState<{
    range: RangeKey;
    start?: string;
    end?: string;
  }>({ range: "monthly" });

  useEffect(() => {
    const controller = new AbortController();
    const hasPreviousData = Boolean(data);

    if (hasPreviousData) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    async function load() {
      setError("");
      try {
        const params = new URLSearchParams({ range: queryRange.range });
        if (queryRange.start && queryRange.end) {
          params.set("start", queryRange.start);
          params.set("end", queryRange.end);
        }

        const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          setError(payload.error || "Failed to load analytics.");
          return;
        }

        const payload = (await response.json()) as AnalyticsData;
        setData(payload);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }
        console.error(fetchError);
        setError("A network error occurred while loading analytics.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }

    void load();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryRange.range, queryRange.start, queryRange.end]);

  const revenueTrend = useMemo<TrendPoint[]>(
    () =>
      (data?.series || []).map((point) => ({
        key: point.key,
        label: point.label,
        value: point.revenue,
      })),
    [data?.series],
  );

  const ordersTrend = useMemo<TrendPoint[]>(
    () =>
      (data?.series || []).map((point) => ({
        key: point.key,
        label: point.label,
        value: point.orders,
      })),
    [data?.series],
  );

  const paymentTotal = useMemo(
    () =>
      (data?.paymentBreakdown || []).reduce(
        (sum, item) => sum + item.count,
        0,
      ),
    [data?.paymentBreakdown],
  );

  const orderStatusTotal = useMemo(
    () =>
      (data?.statusBreakdown || []).reduce((sum, item) => sum + item.count, 0),
    [data?.statusBreakdown],
  );

  function applyPreset(range: RangeKey) {
    setSelectedRange(range);
    setQueryRange({ range });
  }

  function applyCustomRange() {
    if (!customStart || !customEnd) return;
    setQueryRange({ range: selectedRange, start: customStart, end: customEnd });
  }

  return (
    <div>
      <AdminTopbar
        title="Analytics Dashboard"
        subtitle="Revenue, orders, inventory and product performance at a glance."
      />

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => applyPreset(option.key)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                selectedRange === option.key && !queryRange.start
                  ? "border-indigo-700 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-500">
            Start
            <input
              type="date"
              value={customStart}
              onChange={(event) => setCustomStart(event.target.value)}
              className="mt-1 h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-800"
            />
          </label>
          <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-500">
            End
            <input
              type="date"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
              className="mt-1 h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-800"
            />
          </label>
          <button
            type="button"
            onClick={applyCustomRange}
            disabled={!customStart || !customEnd}
            className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply custom range
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p>
            {data?.range?.label || "Loading range..."}
            {data?.range?.isCustom ? " (custom)" : ""}
          </p>
          {refreshing ? <p className="text-xs text-indigo-600">Updating...</p> : null}
        </div>
      </section>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <div className="grid gap-4 xl:grid-cols-5">
            <Skeleton className="h-[360px] rounded-2xl xl:col-span-3" />
            <Skeleton className="h-[360px] rounded-2xl xl:col-span-2" />
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          No analytics data available.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Gross Revenue
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatMoney(data.summary.revenue, data.store.currency)}
              </p>
              <p
                className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${changeClass(
                  data.changes.revenue,
                )}`}
              >
                {formatChange(data.changes.revenue)}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Paid Revenue
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatMoney(data.summary.paidRevenue, data.store.currency)}
              </p>
              <p
                className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${changeClass(
                  data.changes.paidRevenue,
                )}`}
              >
                {formatChange(data.changes.paidRevenue)}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Orders
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {compactNumber(data.summary.orders)}
              </p>
              <p
                className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${changeClass(
                  data.changes.orders,
                )}`}
              >
                {formatChange(data.changes.orders)}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Avg Order Value
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {formatMoney(data.summary.averageOrderValue, data.store.currency)}
              </p>
              <p
                className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${changeClass(
                  data.changes.averageOrderValue,
                )}`}
              >
                {formatChange(data.changes.averageOrderValue)}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Items Sold
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {compactNumber(data.summary.itemsSold)}
              </p>
              <p
                className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${changeClass(
                  data.changes.itemsSold,
                )}`}
              >
                {formatChange(data.changes.itemsSold)}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Active Customers
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {compactNumber(data.summary.customers)}
              </p>
              <p
                className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${changeClass(
                  data.changes.customers,
                )}`}
              >
                {formatChange(data.changes.customers)}
              </p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <AreaTrendChart
                title="Revenue Trend"
                subtitle={`${data.range.label} revenue movement`}
                data={revenueTrend}
                valueFormatter={(value) => compactNumber(value)}
                tooltipFormatter={(value) =>
                  formatMoney(value, data.store.currency)
                }
              />
            </div>
            <div className="xl:col-span-2">
              <BarTrendChart
                title="Orders Trend"
                subtitle={`${data.range.label} order volume`}
                data={ordersTrend}
                valueFormatter={(value) => compactNumber(value)}
                tooltipFormatter={(value) => `${Math.round(value)} orders`}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Payment Status Breakdown
              </h3>
              <p className="text-sm text-slate-500">
                Distribution by payment status in selected range.
              </p>

              <div className="mt-4 space-y-3">
                {data.paymentBreakdown.length ? (
                  data.paymentBreakdown.map((item) => {
                    const ratio = paymentTotal
                      ? (item.count / paymentTotal) * 100
                      : 0;
                    return (
                      <div key={item.status}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {normalizeStatusLabel(item.status)}
                          </span>
                          <span className="text-slate-500">
                            {item.count} orders
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(100, ratio)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatMoney(item.amount, data.store.currency)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No payment data in this range.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Fulfillment Status Breakdown
              </h3>
              <p className="text-sm text-slate-500">
                Order processing status across selected dates.
              </p>

              <div className="mt-4 space-y-3">
                {data.statusBreakdown.length ? (
                  data.statusBreakdown.map((item) => {
                    const ratio = orderStatusTotal
                      ? (item.count / orderStatusTotal) * 100
                      : 0;
                    return (
                      <div key={item.status}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {normalizeStatusLabel(item.status)}
                          </span>
                          <span className="text-slate-500">{item.count} orders</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-cyan-500"
                            style={{ width: `${Math.min(100, ratio)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">No status data in this range.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Inventory Snapshot</h3>
              <p className="text-sm text-slate-500">
                Current product and stock health.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total Products
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {data.inventory.totalProducts}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Published
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {data.inventory.publishedProducts}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Draft
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {data.inventory.draftProducts}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Low Stock
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-700">
                    {data.inventory.lowStockProducts}
                  </p>
                </div>
                <div className="col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-rose-700">
                    Out Of Stock
                  </p>
                  <p className="mt-1 text-xl font-bold text-rose-700">
                    {data.inventory.outOfStockProducts}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Top Products</h3>
              <p className="text-sm text-slate-500">
                Best-performing products by revenue in selected range.
              </p>

              <div className="mt-4 space-y-3">
                {data.topProducts.length ? (
                  data.topProducts.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatMoney(item.revenue, data.store.currency)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Qty sold: {item.quantity}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No product sales in this range.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Category Performance
              </h3>
              <p className="text-sm text-slate-500">
                Revenue contribution by category.
              </p>

              <div className="mt-4 space-y-3">
                {data.categoryPerformance.length ? (
                  data.categoryPerformance.map((item) => {
                    const maxRevenue = Math.max(
                      1,
                      ...data.categoryPerformance.map((entry) => entry.revenue),
                    );
                    const width = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={item.category}>
                        <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                          <span className="line-clamp-1 font-medium text-slate-700">
                            {item.category}
                          </span>
                          <span className="text-slate-500">
                            {formatMoney(item.revenue, data.store.currency)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-violet-500"
                            style={{ width: `${Math.min(100, width)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.orders} orders | {item.quantity} units
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">
                    No category performance data in this range.
                  </p>
                )}
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Store</p>
                <p className="text-lg font-bold text-slate-900">
                  {data.store.businessName}
                </p>
                <p className="text-sm text-slate-500">/{data.store.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    data.store.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {data.store.status}
                </span>
                <Link
                  href={`/${data.store.slug}`}
                  target="_blank"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open storefront
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

