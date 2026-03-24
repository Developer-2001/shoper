"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";

type StoreAdmin = {
  id: string;
  ownerName: string;
  email: string;
  mobile: string;
};

type PlatformStore = {
  id: string;
  businessName: string;
  businessEmail: string;
  ownerName: string;
  mobile: string;
  slug: string;
  currency: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  admins: StoreAdmin[];
};

export default function PlatformAdminPage() {
  const [stores, setStores] = useState<PlatformStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  async function loadStores() {
    setLoading(true);
    const response = await fetch("/api/admin/platform/stores");

    if (response.ok) {
      const data = await response.json();
      setStores(data.stores || []);
      if (!selectedStoreId && data.stores?.length) {
        setSelectedStoreId(data.stores[0].id);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadStores();
  }, []);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) || null,
    [stores, selectedStoreId]
  );

  async function toggleStatus(store: PlatformStore) {
    setUpdatingId(store.id);

    const nextStatus = store.status === "active" ? "inactive" : "active";

    const response = await fetch("/api/admin/platform/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: store.id, status: nextStatus }),
    });

    setUpdatingId("");

    if (!response.ok) {
      alert("Failed to update store status");
      return;
    }

    await loadStores();
  }

  return (
    <div>
      <AdminTopbar
        title="Platform Dashboard"
        subtitle="Manage store activation and inspect store/admin account details."
      />

      {loading ? (
        <p className="text-slate-600">Loading stores...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Total Stores</p>
              <p className="text-3xl font-black text-slate-900">{stores.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Active Stores</p>
              <p className="text-3xl font-black text-emerald-700">
                {stores.filter((store) => store.status === "active").length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Inactive Stores</p>
              <p className="text-3xl font-black text-orange-700">
                {stores.filter((store) => store.status === "inactive").length}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <label className="text-sm font-semibold text-slate-700" htmlFor="storeSelect">
              Select a store
            </label>
            <select
              id="storeSelect"
              value={selectedStoreId}
              onChange={(event) => setSelectedStoreId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 md:max-w-xl"
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.businessName} (/{store.slug})
                </option>
              ))}
            </select>

            {selectedStore ? (
              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-slate-900">{selectedStore.businessName}</p>
                    <p className="text-sm text-slate-600">/{selectedStore.slug}</p>
                  </div>
                  <button
                    disabled={updatingId === selectedStore.id}
                    onClick={() => toggleStatus(selectedStore)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                      selectedStore.status === "active" ? "bg-orange-600" : "bg-emerald-700"
                    }`}
                  >
                    {updatingId === selectedStore.id
                      ? "Updating..."
                      : selectedStore.status === "active"
                      ? "Set Inactive"
                      : "Set Active"}
                  </button>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <p><span className="font-semibold">Status:</span> {selectedStore.status}</p>
                  <p><span className="font-semibold">Currency:</span> {selectedStore.currency}</p>
                  <p><span className="font-semibold">Business Email:</span> {selectedStore.businessEmail}</p>
                  <p><span className="font-semibold">Owner Name:</span> {selectedStore.ownerName}</p>
                  <p><span className="font-semibold">Owner Mobile:</span> {selectedStore.mobile}</p>
                </div>

                <div className="mt-5">
                  <p className="font-semibold text-slate-900">Store Admin Accounts</p>
                  {!selectedStore.admins.length ? (
                    <p className="mt-2 text-sm text-slate-600">No admin user mapped.</p>
                  ) : (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Mobile</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStore.admins.map((admin) => (
                            <tr key={admin.id} className="border-t border-slate-200">
                              <td className="px-3 py-2">{admin.ownerName}</td>
                              <td className="px-3 py-2">{admin.email}</td>
                              <td className="px-3 py-2">{admin.mobile}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Admins</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{store.businessName}</td>
                    <td className="px-4 py-3">/{store.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          store.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {store.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{store.admins.length}</td>
                    <td className="px-4 py-3">
                      <button
                        disabled={updatingId === store.id}
                        onClick={() => toggleStatus(store)}
                        className="text-sm font-semibold text-slate-700 underline"
                      >
                        {store.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
