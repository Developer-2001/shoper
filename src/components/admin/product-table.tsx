"use client";

import Image from "next/image";
import { Eye, Pencil, X } from "lucide-react";

import { Spinner } from "@/components/admin/ui/loader";
import { isVideoUrl } from "@/utils/media";

type ProductTableItem = {
  _id: string;
  name: string;
  images: string[];
  price: number;
  category: string;
  inStock: number;
};

type ProductTableProps = {
  products: ProductTableItem[];
  deletingId: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenPreview: (url: string) => void;
};

export function ProductTable({
  products,
  deletingId,
  onEdit,
  onDelete,
  onOpenPreview,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-150 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-t border-slate-200">
              <td className="px-4 py-3">
                {product.images[0] ? (
                  <div
                    className="group relative cursor-pointer"
                    onClick={() => onOpenPreview(product.images[0])}
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
                    <div className="absolute inset-0 flex h-12 w-12 items-center justify-center rounded-lg bg-black/20 opacity-0 transition group-hover:opacity-100">
                      <Eye size={16} className="text-white" />
                    </div>
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3">{product.price}</td>
              <td className="px-4 py-3">{product.category}</td>
              <td className="px-4 py-3">{product.inStock}</td>
              <td className="px-4 py-3 flex justify-center">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => onEdit(product._id)}
                    className="inline-flex items-center gap-1 text-sm cursor-pointer rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === product._id}
                    onClick={() => onDelete(product._id)}
                    className="inline-flex items-center gap-1 text-sm cursor-pointer rounded-xl border border-red-500 bg-red-50 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    {deletingId === product._id ? (
                      <Spinner size={14} className="text-red-600" />
                      ) : null}
                      <X size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
