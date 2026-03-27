"use client";

import { useEffect, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { TableSkeleton } from "@/components/admin/ui/skeleton";

type Order = {
  _id: string;
  orderNumber: string;
  customer: { customerName: string; email: string; mobile: string };
  shipping: { shippingAddress: string; city: string; state: string; postalCode: string };
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  status: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/orders");
        if (!response.ok) {
          setError("Failed to fetch orders. Please try again.");
          return;
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
        setError("A network error occurred.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <AdminTopbar title="Orders" subtitle="View customer and shipping details with expand/collapse." />

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold text-sm">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="space-y-4">
        {orders.map((order) => (
          <article key={order._id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{order.orderNumber}</p>
                <p className="text-sm text-slate-600">
                  {order.customer.customerName} - {order.customer.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded((prev) => (prev === order._id ? null : order._id))}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
              >
                {expanded === order._id ? "Collapse" : "Expand"}
              </button>
            </div>

            {expanded === order._id ? (
              <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
                <div>
                  <p className="font-semibold">Shipping</p>
                  <p>{order.shipping.shippingAddress}</p>
                  <p>
                    {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
                  </p>
                  <p className="mt-2">Mobile: {order.customer.mobile}</p>
                </div>
                <div>
                  <p className="font-semibold">Items</p>
                  {order.items.map((item, index) => (
                    <p key={`${order._id}-${index}`}>
                      {item.name} x {item.quantity} = {item.price * item.quantity}
                    </p>
                  ))}
                  <p className="mt-2 font-bold">Subtotal: {order.subtotal}</p>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      )}
    </div>
  );
}
