"use client";

import React, { useState } from "react";
import type { ProductRow } from "@/lib/queries/products";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function DeleteProductDialog({
  open,
  onClose,
  product,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductRow | null;
  onDeleted: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open || !product) return null;

  async function confirm() {
    if (!product) return;
    setErr(null);
    setLoading(true);
    try {
      const supabase = await (supabaseBrowser() as any);
      const { error } = await supabase
        .from("products")
        .update({ deleted_at: new Date().toISOString(), is_active: false, updated_at: new Date().toISOString() })
        .eq("id", product.id);

      if (error) throw error;

      onDeleted(product.id);
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 w-[min(520px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900">Delete product</h3>
          <p className="mt-1 text-sm text-gray-500">
            This will hide the product from admin lists (soft delete).
          </p>
        </div>

        <div className="px-6 py-5">
          {err ? <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}
          <div className="text-sm text-gray-800">
            Are you sure you want to delete <span className="font-semibold">{product.name}</span>?
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={loading}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
