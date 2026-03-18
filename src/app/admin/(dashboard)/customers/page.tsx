"use client";

import { useEffect, useState } from "react";
import { http } from "@/lib/http";

type Customer = {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    async function load() {
      const data = await http<{ customers: Customer[] }>("/api/admin/customers");
      setCustomers(data.customers);
    }

    load();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Customers</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-2 py-3">Name</th>
              <th className="px-2 py-3">Email</th>
              <th className="px-2 py-3">Mobile</th>
              <th className="px-2 py-3">Address</th>
              <th className="px-2 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td className="px-2 py-4 text-slate-500" colSpan={5}>
                  No customers yet.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id} className="border-b border-slate-100">
                  <td className="px-2 py-3 font-medium text-slate-900">{customer.name}</td>
                  <td className="px-2 py-3 text-slate-700">{customer.email}</td>
                  <td className="px-2 py-3 text-slate-700">{customer.mobile}</td>
                  <td className="px-2 py-3 text-slate-700">{customer.address}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
