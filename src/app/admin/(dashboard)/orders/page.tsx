"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  paymentProvider?: "stripe" | "none";
  paymentId?: string;
  createdAt?: string;
};

type PaymentFilter = "all" | "paid" | "unpaid";

type SearchSuggestion = {
  id: string;
  label: string;
  value: string;
  type: "name" | "email" | "both";
  keywords: string;
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

function getCustomerName(order: Order) {
  return (
    [order.customer.firstName, order.customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    [order.shipping?.firstName, order.shipping?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Unknown customer"
  );
}

function getCustomerEmail(order: Order) {
  return (order.customer.email || "").trim();
}

function toLocalDateKey(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
      <p className="text-sm text-slate-700">
        {address?.shippingAddress || "-"}
      </p>
      <p className="text-sm text-slate-700">
        {[address?.city, address?.state, address?.postalCode]
          .filter(Boolean)
          .join(", ")}
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
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  const allSearchSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const options: SearchSuggestion[] = [];

    orders.forEach((order) => {
      const name = getCustomerName(order).trim();
      const email = getCustomerEmail(order);

      if (name && name !== "Unknown customer") {
        const key = `name:${name.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          options.push({
            id: key,
            label: name,
            value: name,
            type: "name",
            keywords: `${name.toLowerCase()} ${email.toLowerCase()}`.trim(),
          });
        }
      }

      if (email) {
        const key = `email:${email.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          options.push({
            id: key,
            label: email,
            value: email,
            type: "email",
            keywords: `${name.toLowerCase()} ${email.toLowerCase()}`.trim(),
          });
        }
      }

      if (name && name !== "Unknown customer" && email) {
        const key = `both:${name.toLowerCase()}|${email.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          options.push({
            id: key,
            label: `${name} (${email})`,
            value: email,
            type: "both",
            keywords: `${name.toLowerCase()} ${email.toLowerCase()}`.trim(),
          });
        }
      }
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [orders]);

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return allSearchSuggestions
      .filter((option) => option.keywords.includes(query))
      .slice(0, 8);
  }, [allSearchSuggestions, searchQuery]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      if (selectedDate) {
        if (!order.createdAt) return false;
        const orderDate = toLocalDateKey(order.createdAt);
        if (orderDate !== selectedDate) {
          return false;
        }
      }

      if (paymentFilter === "paid" && order.paymentStatus !== "paid") {
        return false;
      }

      if (paymentFilter === "unpaid" && order.paymentStatus === "paid") {
        return false;
      }

      if (normalizedQuery) {
        const name = getCustomerName(order).toLowerCase();
        const email = getCustomerEmail(order).toLowerCase();
        const fullText = `${name} ${email}`.trim();
        if (!fullText.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedDate, paymentFilter, searchQuery]);

  const hasFilteredOrders = useMemo(
    () => filteredOrders.length > 0,
    [filteredOrders],
  );

  function clearFilters() {
    setSelectedDate("");
    setSearchQuery("");
    setPaymentFilter("all");
    setIsSearchOpen(false);
  }

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
      {/* control section */}
      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(180px,220px)_minmax(280px,1fr)_minmax(220px,260px)_auto] lg:items-end">
          <label className="flex flex-col text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Date
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-1 w-full h-9 rounded-lg border border-slate-300 px-2.5 text-xs text-slate-800 sm:h-10 sm:px-3 sm:text-sm"
            />
          </label>

          <div
            ref={searchContainerRef}
            className="relative flex flex-col text-[11px] font-semibold uppercase tracking-wide text-slate-500"
          >
            Customer / Email
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search by name or email"
              className="mt-1 h-9 rounded-lg border border-slate-300 px-2.5 text-xs text-slate-800 placeholder:text-slate-400 sm:h-10 sm:px-3 sm:text-sm"
            />
            {isSearchOpen && searchQuery.trim() ? (
              <div className="absolute top-full z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                {searchSuggestions.length ? (
                  searchSuggestions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSearchQuery(option.value);
                        setIsSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs normal-case text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                    >
                      <span className="truncate">{option.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                        {option.type}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-xs normal-case text-slate-500 sm:text-sm">
                    No matching customer found.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col col-span-2 md:col-span-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Payment
            <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg border border-slate-300 bg-slate-50 p-1">
              {(["all", "paid", "unpaid"] as PaymentFilter[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentFilter(value)}
                  className={`rounded-md px-2 py-2 cursor-pointer text-[11px] font-semibold capitalize transition sm:text-xs ${
                    paymentFilter === value
                      ? "border-indigo-700 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          
          <button
            type="button"
            onClick={clearFilters}
            disabled={!selectedDate && !searchQuery.trim() && paymentFilter === "all"}
            className="h-9 w-full col-span-2 md:col-span-1 cursor-pointer rounded-lg border border-slate-300 bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60  sm:h-10 sm:px-4 sm:text-sm lg:w-auto"
          >
            Clear
          </button>
        </div>

        {!loading ? (
          <p className="mt-3 text-xs text-slate-500 sm:text-sm">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        ) : null}
      </section>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : !hasOrders ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No orders found yet.
        </div>
      ) : !hasFilteredOrders ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No orders match your selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currency = order.currency || "INR";
            const itemCount =
              order.itemCount ??
              order.items.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal =
              order.subtotal ??
              order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
            const discountAmount = order.discountAmount ?? 0;
            const shippingCharge = order.shippingCharge ?? 0;
            const taxAmount = order.taxAmount ?? 0;
            const total =
              order.total ??
              subtotal - discountAmount + shippingCharge + taxAmount;
            const customerName = getCustomerName(order);

            return (
              <article
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {order.orderNumber}
                    </p>
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
                      setExpanded((prev) =>
                        prev === order._id ? null : order._id,
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
                  >
                    {expanded === order._id ? "Collapse" : "Expand"}
                  </button>
                </div>

                {expanded === order._id ? (
                  <div className="mt-4 space-y-4 text-sm text-slate-700">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <AddressBlock
                        title="Shipping Address"
                        address={order.shipping}
                      />
                      <AddressBlock
                        title="Billing Address"
                        address={order.billing}
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        Payment & Note
                      </p>
                      <div className="mt-2 grid gap-1 sm:grid-cols-2">
                        <p>
                          Method:{" "}
                          <span className="font-medium capitalize">
                            {order.paymentProvider || "Manual"}
                          </span>
                        </p>
                        <p>
                          Status: <PaymentBadge status={order.paymentStatus} />
                        </p>
                        {order.paymentId && (
                          <p className="sm:col-span-2">
                            Payment ID:{" "}
                            <code className="rounded bg-white px-1 text-xs">
                              {order.paymentId}
                            </code>
                          </p>
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
                      <p className="font-semibold text-slate-900">
                        Price Breakdown
                      </p>
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
                          Discount amount: -
                          {formatMoney(discountAmount, currency)}
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
