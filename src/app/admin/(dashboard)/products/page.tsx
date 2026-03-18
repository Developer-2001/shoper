"use client";

import { FormEvent, useEffect, useState } from "react";

import { AdminTopbar } from "@/components/admin/admin-topbar";

type Product = {
  _id: string;
  name: string;
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
  images: "",
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

  async function loadProducts(signal?: AbortSignal) {
    const response = await fetch("/api/admin/products", { signal });
    if (!response.ok) return;
    const data = await response.json();
    setProducts(data.products);
  }

  useEffect(() => {
    const controller = new AbortController();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts(controller.signal).catch(() => {
      // ignore aborted request in unmount
    });

    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload = {
      ...form,
      images: form.images.split(",").map((item) => item.trim()).filter(Boolean),
    };

    const response = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert("Failed to save product");
      return;
    }

    setForm(initialForm);
    setEditingId(null);
    loadProducts();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (response.ok) loadProducts();
  }

  function editProduct(product: Product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: "",
      images: product.images.join(","),
      price: String(product.price),
      currency: product.currency,
      category: product.category,
      discountPercentage: String(product.discountPercentage),
      inStock: String(product.inStock),
    });
  }

  return (
    <div>
      <AdminTopbar title="Products" subtitle="Create, edit and manage your store products." />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3 md:grid-cols-2">
          {Object.keys(form).map((key) => (
            <input
              key={key}
              required={!["description"].includes(key)}
              value={form[key as keyof typeof form]}
              onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
              placeholder={key === "images" ? "images (comma separated urls)" : key}
              className="rounded-xl border border-slate-300 px-4 py-2"
            />
          ))}
        </div>
        <button className="mt-4 rounded-xl bg-slate-900 px-5 py-2 font-semibold text-white">
          {editingId ? "Update product" : "Create product"}
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
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
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.price}</td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">{product.inStock}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => editProduct(product)} className="text-teal-700">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(product._id)} className="text-red-600">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
