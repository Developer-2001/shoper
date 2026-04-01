"use client";

import Image from "next/image";
import { Check, Copy, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { TableSkeleton } from "@/components/admin/ui/skeleton";
import { Spinner } from "@/components/admin/ui/loader";
import { encodeStorageObjectPath } from "@/utils/media";

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
  paymentSettings?: {
    stripe?: {
      enabled: boolean;
      accountId: string;
    };
  };
  admins: StoreAdmin[];
};

type PlatformImage = {
  name: string;
  fileName: string;
  contentType: string;
  size: number;
  updated: string | null;
  url: string;
};

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export default function PlatformAdminPage() {
  const [stores, setStores] = useState<PlatformStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [images, setImages] = useState<PlatformImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageName, setDeletingImageName] = useState("");
  const [copiedImageUrl, setCopiedImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadStores() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/platform/stores");

      if (response.ok) {
        const data = await response.json();
        const nextStores = (data.stores || []) as PlatformStore[];
        setStores(nextStores);
        setSelectedStoreId((currentValue) => {
          if (currentValue && nextStores.some((store) => store.id === currentValue)) {
            return currentValue;
          }
          return nextStores[0]?.id || "";
        });
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to load stores. Please check your connection.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) || null,
    [stores, selectedStoreId]
  );

  async function loadStoreImages(slug: string) {
    setImagesLoading(true);
    setImagesError("");

    try {
      const response = await fetch(`/api/admin/platform/storage?slug=${encodeURIComponent(slug)}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setImagesError(data.error || "Failed to load images for this store.");
        setImages([]);
        return;
      }

      const data = await response.json();
      setImages((data.files || []) as PlatformImage[]);
    } catch (err) {
      console.error(err);
      setImagesError("Network error while loading store images.");
      setImages([]);
    } finally {
      setImagesLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedStore?.slug) return;
    void loadStoreImages(selectedStore.slug);
  }, [selectedStore?.slug]);

  async function toggleStatus(store: PlatformStore) {
    setUpdatingId(store.id);

    const nextStatus = store.status === "active" ? "inactive" : "active";

    // Client-side check for Stripe
    if (nextStatus === "active" && !store.paymentSettings?.stripe?.enabled) {
      alert("Cannot activate store: Stripe is not connected or enabled.");
      setUpdatingId("");
      return;
    }

    try {
      const response = await fetch("/api/admin/platform/stores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: store.id, status: nextStatus }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Failed to update store status");
        return;
      }

      await loadStores();
    } catch (err) {
      console.error(err);
      alert("A network error occurred while updating status.");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleUploadImages() {
    if (!selectedStore || !pendingFiles.length) return;

    setUploadingImages(true);
    setImagesError("");

    try {
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("slug", selectedStore.slug);
        formData.append("file", file);

        const response = await fetch("/api/admin/platform/storage", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }
      }

      setPendingFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await loadStoreImages(selectedStore.slug);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to upload images.";
      setImagesError(message);
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleDeleteImage(file: PlatformImage) {
    if (!confirm(`Delete ${file.fileName}?`)) return;

    setDeletingImageName(file.name);
    setImagesError("");

    try {
      const encodedPath = encodeStorageObjectPath(file.name);
      const response = await fetch(`/api/admin/platform/storage/${encodedPath}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete image.");
      }

      setImages((previous) => previous.filter((item) => item.name !== file.name));
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to delete image.";
      setImagesError(message);
    } finally {
      setDeletingImageName("");
    }
  }

  async function handleCopyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedImageUrl(url);
      window.setTimeout(() => setCopiedImageUrl(""), 1200);
    } catch {
      alert("Unable to copy URL. Please copy manually.");
    }
  }

  return (
    <div>
      <AdminTopbar
        title="Platform Dashboard"
        subtitle="Manage store activation, inspect accounts, and handle per-store theme images."
      />

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">Error Loading Stores</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => loadStores()} 
            className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <TableSkeleton rows={5} />
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
              onChange={(event) => {
                setSelectedStoreId(event.target.value);
                setPendingFiles([]);
                setImagesError("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
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
                    className={`relative flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-hidden focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
                      selectedStore.status === "active" ? "bg-slate-900" : "bg-slate-200"
                    }`}
                  >
                    {updatingId === selectedStore.id ? (
                      <div className="flex w-full justify-center">
                        <Spinner size={14} className={selectedStore.status === "active" ? "text-white" : "text-slate-900"} />
                      </div>
                    ) : (
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          selectedStore.status === "active" ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    )}
                  </button>
                </div>

                <div className="mt-4">
                  <p className="font-semibold text-slate-900">Store Info</p>
                  <div className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    <p><span className="font-semibold">Status:</span> {selectedStore.status}</p>
                    <p>
                       <span className="font-semibold">Payment Status:</span>{" "}
                       {selectedStore.paymentSettings?.stripe?.enabled ? (
                         <span className="text-emerald-600 font-bold">Stripe Enabled</span>
                       ) : (
                         <span className="text-amber-600 font-bold">Not Connected</span>
                       )}
                    </p>
                    <p><span className="font-semibold">Currency:</span> {selectedStore.currency}</p>
                    <p><span className="font-semibold">Business Email:</span> {selectedStore.businessEmail}</p>
                    <p><span className="font-semibold">Owner Name:</span> {selectedStore.ownerName}</p>
                    <p><span className="font-semibold">Owner Mobile:</span> {selectedStore.mobile}</p>
                    <p><span className="font-semibold">Updated:</span> {formatDate(selectedStore.updatedAt)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="font-semibold text-slate-900">Store Admin Info</p>
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

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">Theme Images</p>
                      <p className="text-xs text-slate-500">
                        Storage path: <span className="font-semibold">/{selectedStore.slug}/themeimages/</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {images.length} image{images.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => setPendingFiles(Array.from(event.target.files || []))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleUploadImages}
                      disabled={!pendingFiles.length || uploadingImages}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {uploadingImages ? <Spinner size={12} className="text-white" /> : <UploadCloud size={14} />}
                      {uploadingImages ? "Uploading..." : "Upload"}
                    </button>
                    {!!pendingFiles.length && (
                      <p className="text-xs text-slate-600">
                        {pendingFiles.length} file{pendingFiles.length === 1 ? "" : "s"} selected
                      </p>
                    )}
                  </div>

                  {imagesError ? (
                    <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {imagesError}
                    </p>
                  ) : null}

                  {imagesLoading ? (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                      <Spinner size={14} />
                      Loading images...
                    </div>
                  ) : !images.length ? (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                      <ImagePlus className="mx-auto mb-2 text-slate-400" size={20} />
                      No images found for this store.
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {images.map((file) => (
                        <div key={file.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <div className="relative aspect-video bg-slate-100">
                            <Image
                              src={file.url}
                              alt={file.fileName}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                          <div className="space-y-2 p-3">
                            <p className="line-clamp-1 text-sm font-semibold text-slate-900">{file.fileName}</p>
                            <p className="text-xs text-slate-500">
                              {formatBytes(file.size)} · {formatDate(file.updated)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(file.url)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                              >
                                {copiedImageUrl === file.url ? <Check size={12} /> : <Copy size={12} />}
                                {copiedImageUrl === file.url ? "Copied" : "Copy URL"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(file)}
                                disabled={deletingImageName === file.name}
                                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-60"
                              >
                                {deletingImageName === file.name ? (
                                  <Spinner size={12} className="text-red-600" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                                {deletingImageName === file.name ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Payments</th>
                  <th className="px-4 py-3 text-center">Admins</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{store.businessName}</td>
                    <td className="px-4 py-3">/{store.slug}</td>
                    <td className="px-4 py-3 text-center">
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
                    <td className="px-4 py-3 text-center">
                       {store.paymentSettings?.stripe?.enabled ? (
                         <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                           Stripe Connected
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">
                           Not Connected
                         </span>
                       )}
                    </td>
                    <td className="px-4 py-3 text-center">{store.admins.length}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={updatingId === store.id}
                        onClick={() => toggleStatus(store)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 underline disabled:opacity-50"
                      >
                        {updatingId === store.id && <Spinner size={12} />}
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
