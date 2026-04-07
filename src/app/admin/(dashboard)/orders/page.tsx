"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { TableSkeleton } from "@/components/admin/ui/skeleton";
import { formatMoney } from "@/utils/currency";

type OrderAddress = {
  country?: string;
  firstName?: string;
  lastName?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  shipping?: OrderAddress;
  billing?: OrderAddress;
  useShippingAsBilling?: boolean;
  cartNote?: string;
  items: { name: string; quantity: number; price: number }[];
  itemCount?: number;
  currency?: string;
  subtotal?: number;
  discountCode?: string;
  discountPercentage?: number;
  discountAmount?: number;
  shippingCharge?: number;
  taxPercentage?: number;
  taxAmount?: number;
  total?: number;
  status: string;
  paymentStatus?: "unpaid" | "paid" | "failed";
  paymentProvider?: "stripe" | "helcim" | "none";
  paymentId?: string;
  createdAt?: string;
};

function PaymentBadge({ status }: { status?: string }) {
  const isPaid = status === "paid";
  const isFailed = status === "failed";

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
        isPaid
          ? "bg-green-100 text-green-700"
          : isFailed
            ? "bg-red-100 text-red-700"
            : "bg-amber-100 text-amber-700"
      }`}
    >
      {status || "unpaid"}
    </span>
  );
}

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address?: OrderAddress;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-700">
        {[address?.firstName, address?.lastName].filter(Boolean).join(" ")}
      </p>
      <p className="text-sm text-slate-700">{address?.shippingAddress || "-"}</p>
      <p className="text-sm text-slate-700">
        {[address?.city, address?.state, address?.postalCode].filter(Boolean).join(", ")}
      </p>
      <p className="text-sm text-slate-700">{address?.country || "-"}</p>
    </div>
  );
}

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

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  return (
    <div>
      <AdminTopbar
        title="Orders"
        subtitle="Track customer, address, discount, tax and total breakdown for each order."
      />

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : null}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : !hasOrders ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No orders found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currency = order.currency || "INR";
            const itemCount =
              order.itemCount ??
              order.items.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal =
              order.subtotal ??
              order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const discountAmount = order.discountAmount ?? 0;
            const shippingCharge = order.shippingCharge ?? 0;
            const taxAmount = order.taxAmount ?? 0;
            const total =
              order.total ??
              subtotal - discountAmount + shippingCharge + taxAmount;
            const customerName =
              [order.customer.firstName, order.customer.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() ||
              [order.shipping?.firstName, order.shipping?.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() ||
              "Unknown customer";

            return (
              <article key={order._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-600">
                      {customerName} - {order.customer.email || "No email"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <div className="mb-1 flex items-center gap-2">
                       <PaymentBadge status={order.paymentStatus} />
                       <p className="text-xs font-bold uppercase text-slate-500">
                        {order.status}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {formatMoney(total, currency)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((prev) => (prev === order._id ? null : order._id))
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
                  >
                    {expanded === order._id ? "Collapse" : "Expand"}
                  </button>
                </div>

                {expanded === order._id ? (
                  <div className="mt-4 space-y-4 text-sm text-slate-700">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <AddressBlock title="Shipping Address" address={order.shipping} />
                      <AddressBlock title="Billing Address" address={order.billing} />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">Payment & Note</p>
                      <div className="mt-2 grid gap-1 sm:grid-cols-2">
                         <p>Method: <span className="font-medium capitalize">{order.paymentProvider || "Manual"}</span></p>
                         <p>Status: <PaymentBadge status={order.paymentStatus} /></p>
                         {order.paymentId && (
                           <p className="sm:col-span-2">Payment ID: <code className="rounded bg-white px-1 text-xs">{order.paymentId}</code></p>
                         )}
                      </div>
                      {order.cartNote ? (
                        <p className="mt-2 rounded-lg bg-white p-2 text-xs text-slate-700">
                          Note: {order.cartNote}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">Items</p>
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, index) => (
                          <p key={`${order._id}-${index}`}>
                            {index + 1}. {item.name} x {item.quantity} ={" "}
                            {formatMoney(item.price * item.quantity, currency)}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">Price Breakdown</p>
                      <div className="mt-2 grid gap-1 sm:grid-cols-2">
                        <p>Item count: {itemCount}</p>
                        <p>Subtotal: {formatMoney(subtotal, currency)}</p>
                        <p>Shipping: {formatMoney(shippingCharge, currency)}</p>
                        <p>
                          Tax ({order.taxPercentage ?? 3}%):{" "}
                          {formatMoney(taxAmount, currency)}
                        </p>
                        <p>
                          Discount:{" "}
                          {order.discountCode
                            ? `${order.discountCode} (${order.discountPercentage ?? 0}%)`
                            : "N/A"}
                        </p>
                        <p>
                          Discount amount: -{formatMoney(discountAmount, currency)}
                        </p>
                      </div>
                      <p className="mt-3 text-base font-bold text-slate-900">
                        Grand total: {formatMoney(total, currency)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
