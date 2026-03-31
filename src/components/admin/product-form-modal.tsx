"use client";

import Image from "next/image";
import { FormEvent, type Dispatch, type SetStateAction, useState } from "react";
import { ChevronDown, Plus, Sparkles, X } from "lucide-react";

import { CategoryDropdown } from "@/components/admin/category-dropdown";
import { Spinner } from "@/components/admin/ui/loader";
import { currencyOptions } from "@/utils/currency";
import { isVideoUrl } from "@/utils/media";

type ProductFormState = {
  name: string;
  description: string;
  images: string[];
  price: string;
  currency: string;
  category: string;
  discountPercentage: string;
  inStock: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormModalProps = {
  isOpen: boolean;
  isEditing: boolean;
  uploadingImages: boolean;
  form: ProductFormState;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  pendingProductFiles: File[];
  pendingProductPreviews: { url: string; file: File }[];
  maxProductMedia: number;
  categories: CategoryOption[];
  categoriesLoading: boolean;
  isCategoryModalOpen: boolean;
  newCategoryName: string;
  creatingCategory: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onAddPendingFiles: (files: FileList | null) => void;
  onRemovePendingFile: (index: number) => void;
  onReplaceMedia: (index: number, file: File) => void;
  onRemoveMedia: (url: string) => void;
  onOpenPreview: (url: string) => void;
  onOpenAI: (url: string) => void;
  onOpenCategoryModal: (initialName: string) => void;
  onCloseCategoryModal: () => void;
  setNewCategoryName: (value: string) => void;
  onCreateCategory: () => void;
};

export function ProductFormModal({
  isOpen,
  isEditing,
  uploadingImages,
  form,
  setForm,
  pendingProductPreviews,
  maxProductMedia,
  categories,
  categoriesLoading,
  isCategoryModalOpen,
  newCategoryName,
  creatingCategory,
  onClose,
  onSubmit,
  onAddPendingFiles,
  onRemovePendingFile,
  onReplaceMedia,
  onRemoveMedia,
  onOpenPreview,
  onOpenAI,
  onOpenCategoryModal,
  onCloseCategoryModal,
  setNewCategoryName,
  onCreateCategory,
}: ProductFormModalProps) {
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        onClick={onClose}
      >
        <div
          className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Product" : "Add Product"}
              </h3>
              <p className="text-sm text-slate-500">
                Fill product details and manage media.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Basic Details
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Product Name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Enter product name"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition focus:border-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <CategoryDropdown
                      value={form.category}
                      options={categories}
                      loading={categoriesLoading}
                      onSelect={(name) =>
                        setForm((prev) => ({ ...prev, category: name }))
                      }
                      onAddNew={onOpenCategoryModal}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Write a short product description"
                      className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 outline-hidden transition focus:border-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <button
                  type="button"
                  onClick={() => setIsMediaExpanded((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <p className="text-sm font-semibold text-slate-800">Product Media</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {form.images.length}/{maxProductMedia}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition ${isMediaExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isMediaExpanded ? (
                  <>
                    <input
                      id="product-add-input"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(event) => onAddPendingFiles(event.target.files)}
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

                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => onOpenPreview(url)}
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
                          {form.images.length + pendingProductPreviews.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() => onRemoveMedia(url)}
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
                              onReplaceMedia(index, file);
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
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => onOpenPreview(preview.url)}
                            className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                          >
                            View
                          </button>
                          {form.images.length + pendingProductPreviews.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() => onRemovePendingFile(index)}
                              className="rounded-lg border border-slate-900 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900"
                            >
                              Remove
                            </button>
                          )}
                          {!preview.file.type.startsWith("video/") && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpenAI(preview.url);
                              }}
                              className="flex items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                              <Sparkles size={12} />
                              AI
                            </button>
                          )}
                        </div>
                        <div className="absolute left-2 top-2 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Pending
                        </div>
                      </div>
                      ))}

                      {form.images.length + pendingProductPreviews.length <
                        maxProductMedia && (
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("product-add-input")?.click()
                          }
                          className="flex h-44 flex-col items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400"
                        >
                          <Plus size={26} />
                          <span className="mt-2 text-sm font-medium">
                            Choose Media
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pricing And Inventory
                </p>
                <div className="mt-3 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Price
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          price: event.target.value,
                        }))
                      }
                      placeholder="0.00"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition focus:border-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Currency
                    </label>
                    <select
                      required
                      value={form.currency}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          currency: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition focus:border-slate-500"
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Discount Percentage
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      max="90"
                      value={form.discountPercentage}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          discountPercentage: event.target.value,
                        }))
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition focus:border-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Stock Quantity
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.inStock}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          inStock: event.target.value,
                        }))
                      }
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-hidden transition focus:border-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  {uploadingImages && (
                    <Spinner size={16} className="text-white" />
                  )}
                  {uploadingImages
                    ? "Saving..."
                    : isEditing
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isCategoryModalOpen ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (creatingCategory) return;
            onCloseCategoryModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900">
              Create Category
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Add a new category for this store.
            </p>
            <input
              autoFocus
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Category name"
              className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-2"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCloseCategoryModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                disabled={creatingCategory}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onCreateCategory}
                disabled={creatingCategory}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {creatingCategory ? (
                  <Spinner size={14} className="text-white" />
                ) : (
                  <Plus size={14} />
                )}
                {creatingCategory ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
