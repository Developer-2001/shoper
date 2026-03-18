"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCT_CATEGORIES, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { http } from "@/lib/http";
import { formatCurrency } from "@/lib/utils";

type ProductItem = {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  category: string;
  discount: number;
  isActive: boolean;
};

type ProductFormState = {
  name: string;
  description: string;
  imagesInput: string;
  price: string;
  currency: string;
  category: string;
  discount: string;
  isActive: boolean;
};

const initialForm: ProductFormState = {
  name: "",
  description: "",
  imagesInput: "",
  price: "",
  currency: "INR",
  category: PRODUCT_CATEGORIES[0],
  discount: "0",
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts(query = "") {
    const data = await http<{ products: ProductItem[] }>(`/api/admin/products?search=${encodeURIComponent(query)}`);
    setProducts(data.products);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const productsToRender = useMemo(() => products, [products]);

  function clearForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function beginEdit(product: ProductItem) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      imagesInput: product.images.join(", "),
      price: String(product.price),
      currency: product.currency,
      category: product.category,
      discount: String(product.discount),
      isActive: product.isActive,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: form.name,
      description: form.description,
      images: form.imagesInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      price: Number(form.price),
      currency: form.currency,
      category: form.category,
      discount: Number(form.discount),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await http(`/api/admin/products/${editingId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await http("/api/admin/products", {
          method: "POST",
          body: payload,
        });
      }

      clearForm();
      await loadProducts(search);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to save product");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    await http(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    await loadProducts(search);
  }

  async function handleSearch() {
    await loadProducts(search);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>
          {editingId ? (
            <Button variant="ghost" onClick={clearForm}>
              Cancel Edit
            </Button>
          ) : null}
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input
            placeholder="Product Name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <Input
            placeholder="Image URLs (comma separated)"
            value={form.imagesInput}
            onChange={(event) => setForm((prev) => ({ ...prev, imagesInput: event.target.value }))}
            required
          />

          <textarea
            className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />

          <Input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            required
          />
          <Input
            type="number"
            placeholder="Discount %"
            value={form.discount}
            onChange={(event) => setForm((prev) => ({ ...prev, discount: event.target.value }))}
            required
          />

          <select
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            value={form.currency}
            onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>

          <select
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Active Product
          </label>

          {error ? <p className="text-sm text-rose-600 md:col-span-2">{error}</p> : null}

          <Button type="submit" className="gap-2 md:col-span-2" disabled={loading}>
            <Plus className="size-4" />
            {loading ? "Saving..." : editingId ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="space-y-3">
          {productsToRender.length === 0 ? (
            <p className="text-sm text-slate-600">No products added yet.</p>
          ) : (
            productsToRender.map((product) => (
              <article
                key={product._id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-500">{product.category}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatCurrency(
                      product.price - product.price * (product.discount / 100),
                      product.currency,
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" className="gap-2" onClick={() => beginEdit(product)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button variant="danger" className="gap-2" onClick={() => handleDelete(product._id)}>
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
