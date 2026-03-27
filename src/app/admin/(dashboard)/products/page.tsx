"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Sparkles, X, Eye } from "lucide-react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import {
  encodeStorageObjectPath,
  extractStorageObjectPath,
  isVideoUrl,
} from "@/utils/media";
import { AIEnhanceModal } from "@/components/admin/ai-enhance-modal";
import { currencyOptions } from "@/utils/currency";

const MAX_PRODUCT_MEDIA = 6;
const PRODUCT_MEDIA_FOLDER = "products";

type Product = {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  category: string;
  discountPercentage: number;
  inStock: number;
};

const initialForm = {
  name: "",
  description: "",
  images: [] as string[],
  price: "",
  currency: "INR",
  category: "",
  discountPercentage: "0",
  inStock: "0",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [pendingProductFiles, setPendingProductFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isAIEnhanceModalOpen, setIsAIEnhanceModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const pendingProductPreviews = useMemo(
    () =>
      pendingProductFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file,
      })),
    [pendingProductFiles],
  );

  useEffect(() => {
    return () => {
      pendingProductPreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    };
  }, [pendingProductPreviews]);

  const [aiEnhanceSource, setAiEnhanceSource] = useState<string>("");

  async function fetchProducts(signal?: AbortSignal) {
    const response = await fetch("/api/admin/products", { signal });
    if (!response.ok) return [] as Product[];
    const data = await response.json();
    return (data.products || []) as Product[];
  }

  async function refreshProducts() {
    const nextProducts = await fetchProducts();
    setProducts(nextProducts);
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void (async () => {
      try {
        const nextProducts = await fetchProducts(controller.signal);
        if (active) {
          setProducts(nextProducts);
        }
      } catch {
        // ignore abort/network errors for initial load
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  async function uploadNewMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", PRODUCT_MEDIA_FOLDER);

    const response = await fetch("/api/storage", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));
      alert(data.error || "Upload failed");
      return null;
    }

    const data = await response.json();
    return data?.file?.url || null;
  }

  const handleAISelectImage = async (imageUrl: string) => {
    if (imageUrl.startsWith("data:")) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-enhanced-image.png", {
        type: "image/png",
      });
      setPendingProductFiles((prev) => [...prev, file]);
    }
    setIsAIEnhanceModalOpen(false);
  };

  async function replaceExistingMedia(
    file: File,
    currentUrl: string,
    fallbackFolder: string,
  ) {
    const path = extractStorageObjectPath(currentUrl);

    if (!path) {
      return uploadNewMedia(file);
    }

    const segments = path.split("/").filter(Boolean);
    const currentFolder = segments.length >= 2 ? segments[1] : "";

    if (currentFolder !== fallbackFolder) {
      const nextUrl = await uploadNewMedia(file);
      if (!nextUrl) return null;

      await deleteMediaFromStorage(currentUrl);
      return nextUrl;
    }

    const formData = new FormData();
    formData.append("file", file);

    const encodedPath = encodeStorageObjectPath(path);
    const response = await fetch(`/api/storage/${encodedPath}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: "Replace failed" }));
      alert(data.error || "Replace failed");
      return null;
    }

    const data = await response.json();
    return data?.file?.url || currentUrl;
  }

  async function deleteMediaFromStorage(url: string) {
    const path = extractStorageObjectPath(url);
    if (!path) return true;

    const encodedPath = encodeStorageObjectPath(path);
    const response = await fetch(`/api/storage/${encodedPath}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: "Delete failed" }));
      alert(data.error || "Delete failed");
      return false;
    }

    return true;
  }

  async function removePendingProductMedia(index: number) {
    setPendingProductFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function replaceProductMedia(index: number, file: File) {
    const currentUrl = form.images[index];
    if (!currentUrl) return;

    const nextUrl = await replaceExistingMedia(
      file,
      currentUrl,
      PRODUCT_MEDIA_FOLDER,
    );
    if (!nextUrl) return;

    setForm((prev) => {
      const media = [...prev.images];
      media[index] = nextUrl;
      return { ...prev, images: media };
    });
  }

  async function removeProductMedia(url: string) {
    const deleted = await deleteMediaFromStorage(url);
    if (!deleted) return;

    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image !== url),
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.images.length && !pendingProductFiles.length) {
      alert("Please upload at least one product media.");
      return;
    }

    setUploadingImages(true);

    // 1. Upload pending images sequentially
    const newlyUploadedUrls: string[] = [];
    for (const file of pendingProductFiles) {
      const url = await uploadNewMedia(file);
      if (url) {
        newlyUploadedUrls.push(url);
      } else {
        alert("Failed to upload some images. Please try again.");
        setUploadingImages(false);
        return;
      }
    }

    const finalImages = [...form.images, ...newlyUploadedUrls];

    if (!finalImages.length) {
      alert("At least one media is required.");
      setUploadingImages(false);
      return;
    }

    const payload = {
      ...form,
      images: finalImages,
    };

    const response = await fetch(
      editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setUploadingImages(false);

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: "Failed to save product" }));
      alert(data.error || "Failed to save product");
      return;
    }

    setForm(initialForm);
    setEditingId(null);
    setPendingProductFiles([]);
    refreshProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const product = products.find((p) => p._id === id);
    if (product?.images) {
      for (const url of product.images) {
        await deleteMediaFromStorage(url);
      }
    }

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    if (response.ok) refreshProducts();
  }

  function editProduct(product: Product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || "",
      images: (product.images || []).slice(0, MAX_PRODUCT_MEDIA),
      price: String(product.price),
      currency: product.currency,
      category: product.category,
      discountPercentage: String(product.discountPercentage),
      inStock: String(product.inStock),
    });
  }

  return (
    <div>
      <AdminTopbar
        title="Products"
        subtitle="Create, edit and manage your store products with uploaded media."
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="name"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            required
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, category: event.target.value }))
            }
            placeholder="category"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="description"
            className="min-h-24 rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">
                Product Media
              </p>
              <span className="text-xs text-slate-500">
                {form.images.length}/{MAX_PRODUCT_MEDIA}
              </span>
            </div>
            <input
              id="product-add-input"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                setPendingProductFiles((prev) => [...prev, ...files]);
              }}
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {form.images.map((url, index) => (
                <div
                  key={url}
                  className="group relative h-44 overflow-hidden rounded-2xl border border-slate-300 bg-white"
                >
                  {isVideoUrl(url) ? (
                    <video
                      src={url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={`product-${index + 1}`}
                      width={220}
                      height={160}
                      className="h-full w-full object-contain"
                    />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 lg:opacity-0 transition lg:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(url);
                        setIsPreviewOpen(true);
                      }}
                      className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                    >
                      View
                    </button>
                    <label
                      htmlFor={`product-change-${index}`}
                      className="cursor-pointer rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                    >
                      Change
                    </label>
                    {form.images.length + pendingProductFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProductMedia(url)}
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    id={`product-change-${index}`}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        replaceProductMedia(index, file);
                      }
                    }}
                  />
                </div>
              ))}

              {pendingProductPreviews.map((preview, index) => (
                <div
                  key={preview.url}
                  className="group relative h-44 overflow-hidden rounded-2xl border border-amber-200 bg-white"
                >
                  {isVideoUrl(preview.url) ||
                  preview.file.type.startsWith("video/") ? (
                    <video
                      src={preview.url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={preview.url}
                      alt="pending product media"
                      width={220}
                      height={160}
                      className="h-full w-full object-contain"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 lg:opacity-0 transition lg:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(preview.url);
                        setIsPreviewOpen(true);
                      }}
                      className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                    >
                      View
                    </button>
                    {form.images.length + pendingProductFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPendingProductFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                      >
                        Remove
                      </button>
                    )}
                    {!preview.file.type.startsWith("video/") && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAiEnhanceSource(preview.url);
                          setIsAIEnhanceModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <Sparkles size={12} />
                        AI
                      </button>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Pending
                  </div>
                </div>
              ))}

              {form.images.length + pendingProductFiles.length <
                MAX_PRODUCT_MEDIA && (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("product-add-input")?.click()
                  }
                  className="flex h-44 flex-col items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400"
                >
                  <Plus size={26} />
                  <span className="mt-2 text-sm font-medium">Choose Media</span>
                </button>
              )}
            </div>
          </div>

          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, price: event.target.value }))
            }
            placeholder="price"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />

          <select
            required
            value={form.currency}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, currency: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-4 py-2"
          >
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            required
            value={form.discountPercentage}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                discountPercentage: event.target.value,
              }))
            }
            placeholder="discountPercentage"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
          <input
            required
            value={form.inStock}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, inStock: event.target.value }))
            }
            placeholder="inStock"
            className="rounded-xl border border-slate-300 px-4 py-2"
          />
        </div>

        <button
          disabled={uploadingImages}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white disabled:opacity-50"
        >
          {uploadingImages
            ? "Saving..."
            : editingId
              ? "Update product"
              : "Create product"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-150 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t border-slate-200">
                <td className="px-4 py-3">
                  {product.images[0] ? (
                    <div
                      className="cursor-pointer group relative"
                      onClick={() => {
                        setPreviewUrl(product.images[0]);
                        setIsPreviewOpen(true);
                      }}
                    >
                      {isVideoUrl(product.images[0]) ? (
                        <video
                          src={product.images[0]}
                          className="h-12 w-12 rounded-lg object-cover"
                          muted
                        />
                      ) : (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-lg transition">
                        <Eye size={16} className="text-white" />
                      </div>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.price}</td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">{product.inStock}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                      className="text-teal-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AIEnhanceModal
        isOpen={isAIEnhanceModalOpen}
        onClose={() => setIsAIEnhanceModalOpen(false)}
        originalImage={aiEnhanceSource}
        onSelectImage={handleAISelectImage}
      />

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X size={32} />
            </button>
            {previewUrl &&
              (isVideoUrl(previewUrl) ? (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  className="max-h-[85vh] rounded-lg"
                />
              ) : (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={800}
                  height={600}
                  className="max-h-[85vh] rounded-lg object-contain"
                />
              ))}
                
          </div>
        </div>
      )}
    </div>
  );
}
