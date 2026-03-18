"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Boxes, CircleDollarSign, Clock3, Users } from "lucide-react";
import { http } from "@/lib/http";
import { formatCurrency } from "@/lib/utils";

type Stats = {
  products: number;
  customers: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
};

type StoreSummary = {
  slug: string;
  currency: string;
  businessName: string;
};

const defaultStats: Stats = {
  products: 0,
  customers: 0,
  orders: 0,
  pendingOrders: 0,
  revenue: 0,
};

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [store, setStore] = useState<StoreSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, storeData] = await Promise.all([
          http<{ stats: Stats }>("/api/admin/dashboard/stats"),
          http<{ store: StoreSummary }>("/api/admin/store"),
        ]);

        setStats(statsData.stats);
        setStore(storeData.store);
      } catch {
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    { label: "Products", value: stats.products, icon: Boxes },
    { label: "Customers", value: stats.customers, icon: Users },
    { label: "Orders", value: stats.orders, icon: BarChart3 },
    { label: "Pending", value: stats.pendingOrders, icon: Clock3 },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-300">Storefront</p>
        <h2 className="mt-1 text-2xl font-bold">{store?.businessName ?? "Your Store"}</h2>
        <p className="mt-2 text-sm text-slate-300">
          Public URL: {store?.slug ? `/${store.slug}` : "Create your store details in Configure Store"}
        </p>
        {store?.slug ? (
          <Link
            className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            href={`/${store.slug}`}
            target="_blank"
          >
            Open Storefront
          </Link>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{card.label}</p>
              <card.icon className="size-4 text-slate-500" />
            </div>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">{loading ? "..." : card.value}</h3>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <CircleDollarSign className="size-5 text-slate-500" />
        </div>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">
          {formatCurrency(stats.revenue, store?.currency ?? "INR")}
        </h3>
        <p className="mt-2 text-sm text-slate-600">Revenue from non-cancelled orders.</p>
      </section>
    </div>
  );
}
