"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { ProductTable } from "@/components/admin/product-table";
import { FilterDropdown } from "@/components/admin/ui/filter-dropdown";
import { TableSkeleton } from "@/components/admin/ui/skeleton";
import {
  encodeStorageObjectPath,
  extractStorageObjectPath,
  isVideoUrl,
} from "@/utils/media";
import { AIEnhanceModal } from "@/components/admin/ai-enhance-modal";

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

type CategoryOption = {
  id: string;
  name: string;
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
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [pendingProductFiles, setPendingProductFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isAIEnhanceModalOpen, setIsAIEnhanceModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

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
  const nameFilterOptions = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.name.trim()).filter(Boolean)),
      )
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ id: name, label: name, value: name })),
    [products],
  );
  const categoryFilterOptions = useMemo(() => {
    const names = new Set<string>();

    categories.forEach((category) => {
      if (category.name.trim()) {
        names.add(category.name.trim());
      }
    });

    products.forEach((product) => {
      if (product.category.trim()) {
        names.add(product.category.trim());
      }
    });

    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ id: name, label: name, value: name }));
  }, [categories, products]);
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (nameFilter.length && !nameFilter.includes(product.name)) {
          return false;
        }
        if (
          categoryFilter.length &&
          !categoryFilter.includes(product.category)
        ) {
          return false;
        }
        return true;
      }),
    [products, nameFilter, categoryFilter],
  );

  async function fetchProducts(signal?: AbortSignal) {
    try {
      const response = await fetch("/api/admin/products", { signal });
      if (!response.ok) return [] as Product[];
      const data = await response.json();
      return (data.products || []) as Product[];
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return [] as Product[];
      }
      console.error(err);
      return [] as Product[];
    }
  }

  async function fetchCategories(signal?: AbortSignal) {
    try {
      const response = await fetch("/api/admin/categories", { signal });
      if (!response.ok) return [] as CategoryOption[];
      const data = await response.json();
      return (data.categories || []) as CategoryOption[];
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return [] as CategoryOption[];
      }
      console.error(err);
      return [] as CategoryOption[];
    }
  }

  async function refreshProducts() {
    setLoading(true);
    const nextProducts = await fetchProducts();
    setProducts(nextProducts);
    setLoading(false);
  }

  async function refreshCategories() {
    setCategoriesLoading(true);
    const nextCategories = await fetchCategories();
    setCategories(nextCategories);
    setCategoriesLoading(false);
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void (async () => {
      try {
        setLoading(true);
        setCategoriesLoading(true);
        const [nextProducts, nextCategories] = await Promise.all([
          fetchProducts(controller.signal),
          fetchCategories(controller.signal),
        ]);
        if (active) {
          setProducts(nextProducts);
          setCategories(nextCategories);
        }
      } catch {
        // ignore abort/network errors for initial load
      } finally {
        if (active) {
          setLoading(false);
          setCategoriesLoading(false);
        }
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

    try {
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
    } catch (err) {
      console.error(err);
      alert("Network error during upload.");
      return null;
    }
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

    try {
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
    } catch (err) {
      console.error(err);
      alert("Network error during media replacement.");
      return null;
    }
  }

  async function deleteMediaFromStorage(url: string) {
    const path = extractStorageObjectPath(url);
    if (!path) return true;

    try {
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
    } catch (err) {
      console.error(err);
      alert("Network error during media deletion.");
      return false;
    }
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

  async function handleCreateCategory() {
    const name = newCategoryName.trim();

    if (name.length < 2) {
      alert("Category name must be at least 2 characters.");
      return;
    }

    setCreatingCategory(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Failed to create category" }));
        alert(data.error || "Failed to create category");
        return;
      }

      const data = await response.json();
      const createdCategory = data?.category as CategoryOption | undefined;

      if (createdCategory?.name) {
        setForm((prev) => ({ ...prev, category: createdCategory.name }));
      }

      await refreshCategories();
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Network error while creating category.");
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.category.trim()) {
      alert("Please select a category.");
      return;
    }

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

    try {
      const response = await fetch(
        editingId ? `/api/admin/products/${editingId}` : "/api/admin/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

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
      setIsFormModalOpen(false);
      refreshProducts();
    } catch (err) {
      console.error(err);
      alert("Network error while saving product.");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const product = products.find((p) => p._id === id);
      if (product?.images) {
        for (const url of product.images) {
          await deleteMediaFromStorage(url);
        }
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (response.ok) await refreshProducts();
    } catch (err) {
      console.error(err);
      alert("Network error during product deletion.");
    } finally {
      setDeletingId(null);
    }
  }

  function editProduct(product: Product) {
    setEditingId(product._id);
    setCategories((prev) => {
      if (!product.category.trim()) return prev;
      if (prev.some((category) => category.name === product.category))
        return prev;
      return [
        ...prev,
        { id: `temp-${product.category}`, name: product.category },
      ].sort((a, b) => a.name.localeCompare(b.name));
    });
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
    setIsFormModalOpen(true);
  }

  function openAddProductModal() {
    setEditingId(null);
    setForm(initialForm);
    setPendingProductFiles([]);
    setIsFormModalOpen(true);
  }

  function handleEditById(id: string) {
    const product = products.find((entry) => entry._id === id);
    if (!product) return;
    editProduct(product);
  }

  return (
    <div>
      <AdminTopbar
        title="Products"
        subtitle="Manage your catalog, stock, and media."
      />

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="space-y-3">
          {/* Filter and Add Product Controls */}
          <div className="rounded-2xl p-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:max-w-xl">
                <FilterDropdown
                  values={nameFilter}
                  options={nameFilterOptions}
                  placeholder="Filter by name"
                  searchPlaceholder="Search product name..."
                  allLabel="All names"
                  onChange={setNameFilter}
                  className="w-full"
                />
                <FilterDropdown
                  values={categoryFilter}
                  options={categoryFilterOptions}
                  placeholder="Filter by category"
                  searchPlaceholder="Search category..."
                  allLabel="All categories"
                  onChange={setCategoryFilter}
                  className="w-full"
                />
              </div>

              <button
                type="button"
                onClick={openAddProductModal}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:w-auto sm:min-w-32"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          </div>

          <ProductTable
            products={filteredProducts}
            deletingId={deletingId}
            onEdit={handleEditById}
            onDelete={handleDelete}
            onOpenPreview={(url) => {
              setPreviewUrl(url);
              setIsPreviewOpen(true);
            }}
          />
        </div>
      )}

      <ProductFormModal
        isOpen={isFormModalOpen}
        isEditing={Boolean(editingId)}
        uploadingImages={uploadingImages}
        form={form}
        setForm={setForm}
        pendingProductFiles={pendingProductFiles}
        pendingProductPreviews={pendingProductPreviews}
        maxProductMedia={MAX_PRODUCT_MEDIA}
        categories={categories}
        categoriesLoading={categoriesLoading}
        isCategoryModalOpen={isCategoryModalOpen}
        newCategoryName={newCategoryName}
        creatingCategory={creatingCategory}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingId(null);
          setForm(initialForm);
          setPendingProductFiles([]);
        }}
        onSubmit={handleSubmit}
        onAddPendingFiles={(files) => {
          const selected = Array.from(files || []);
          setPendingProductFiles((prev) => [...prev, ...selected]);
        }}
        onRemovePendingFile={(index) =>
          setPendingProductFiles((prev) => prev.filter((_, i) => i !== index))
        }
        onReplaceMedia={replaceProductMedia}
        onRemoveMedia={removeProductMedia}
        onOpenPreview={(url) => {
          setPreviewUrl(url);
          setIsPreviewOpen(true);
        }}
        onOpenAI={(url) => {
          setAiEnhanceSource(url);
          setIsAIEnhanceModalOpen(true);
        }}
        onOpenCategoryModal={(initialName) => {
          setNewCategoryName(initialName);
          setIsCategoryModalOpen(true);
        }}
        onCloseCategoryModal={() => setIsCategoryModalOpen(false)}
        setNewCategoryName={setNewCategoryName}
        onCreateCategory={handleCreateCategory}
      />

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
