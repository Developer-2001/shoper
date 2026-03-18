"use client";

import { useEffect, useState } from "react";
import { http } from "@/lib/http";
import { formatCurrency } from "@/lib/utils";

type OrderItem = {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  customerId?: {
    name?: string;
    email?: string;
    mobile?: string;
  } | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    async function load() {
      const [orderData, storeData] = await Promise.all([
        http<{ orders: OrderItem[] }>("/api/admin/orders"),
        http<{ store: { currency: string } }>("/api/admin/store"),
      ]);

      setOrders(orderData.orders);
      setCurrency(storeData.store.currency);
    }

    load();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Orders</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-2 py-3">Customer</th>
              <th className="px-2 py-3">Amount</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Date</th>
              <th className="px-2 py-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className="px-2 py-4 text-slate-500" colSpan={5}>
                  No orders found yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b border-slate-100">
                  <td className="px-2 py-3">
                    <p className="font-medium text-slate-900">{order.customerId?.name ?? "Customer"}</p>
                    <p className="text-xs text-slate-500">{order.customerId?.email ?? "-"}</p>
                  </td>
                  <td className="px-2 py-3 font-medium text-slate-800">
                    {formatCurrency(order.totalAmount, currency)}
                  </td>
                  <td className="px-2 py-3 capitalize text-slate-700">{order.status}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-3 text-slate-600">{order.shippingAddress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
