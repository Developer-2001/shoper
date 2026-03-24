"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AdminTopbar } from "@/components/admin/admin-topbar";

type DashboardData = {
  store: { businessName: string; slug: string; currency: string; status: "active" | "inactive" };
  productsCount: number;
  ordersCount: number;
};

export default function AdminHomePage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function load() {
      const [storeRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/store"),
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
      ]);

      if (!storeRes.ok) return;

      const storeData = await storeRes.json();
      const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };

      setData({
        store: {
          businessName: storeData.store.businessName,
          slug: storeData.store.slug,
          currency: storeData.store.currency,
          status: storeData.store.status || "inactive",
        },
        productsCount: productsData.products.length,
        ordersCount: ordersData.orders.length,
      });
    }

    load();
  }, []);

  return (
    <div>
      <AdminTopbar title="Dashboard Home" subtitle="Track your store performance and quick actions." />

      {!data ? (
        <p className="text-slate-600">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Store</p>
              <p className="text-xl font-bold text-slate-900">{data.store.businessName}</p>
              <p className="text-sm text-slate-600">/{data.store.slug}</p>
              <span
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  data.store.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {data.store.status}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Products</p>
              <p className="text-3xl font-black text-slate-900">{data.productsCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Orders</p>
              <p className="text-3xl font-black text-slate-900">{data.ordersCount}</p>
            </div>
          </div>

          {data.store.status === "inactive" ? (
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-800">
              Store is inactive. Configure your store and wait for platform admin activation.
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">Storefront preview</p>
            <Link href={`/${data.store.slug}`} className="mt-2 inline-block text-teal-700 underline">
              Open /{data.store.slug}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
