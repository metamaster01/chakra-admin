"use client";

import React, { useMemo, useState } from "react";
import type { ProductsAdminPayload, ProductRow } from "@/lib/queries/products";
import ProductUpsertDialog from "./ProductUpsertDialog";
import DeleteProductDialog from "./DeleteProductDialog";

function formatMoney(paise: number, currency = "INR") {
  const amount = (paise ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

function StatusPill({ label, tone }: { label: string; tone: "green" | "yellow" | "red" | "gray" }) {
  const cls =
    tone === "green"
      ? "bg-green-50 text-green-700 ring-green-200"
      : tone === "yellow"
        ? "bg-yellow-50 text-yellow-700 ring-yellow-200"
        : tone === "red"
          ? "bg-red-50 text-red-700 ring-red-200"
          : "bg-gray-50 text-gray-700 ring-gray-200";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function getStockStatus(stock: number) {
  if (stock <= 0) return { label: "Out of Stock", tone: "red" as const };
  if (stock < 5) return { label: "Low Stock", tone: "yellow" as const };
  return { label: "Active", tone: "green" as const };
}

function getPrimaryImage(p: ProductRow) {
  if (p.primary_image_url) return p.primary_image_url;
  const fromImages = p.product_images?.[0]?.url;
  return fromImages ?? null;
}

export default function ProductsTable({ initialData }: { initialData: ProductsAdminPayload }) {
  const [rows, setRows] = useState<ProductRow[]>(initialData?.products ?? []);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((p) => {
      const img = getPrimaryImage(p) ?? "";
      return (
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.sku ?? "").toLowerCase().includes(query) ||
        img.toLowerCase().includes(query)
      );
    });
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  React.useEffect(() => setPage(1), [q]);

  function openAdd() {
    setEditing(null);
    setUpsertOpen(true);
  }

  function openEdit(p: ProductRow) {
    setEditing(p);
    setUpsertOpen(true);
  }

  function openDelete(p: ProductRow) {
    setDeleting(p);
    setDeleteOpen(true);
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Products</h3>
            <p className="text-sm text-gray-500 mt-1">Search and manage products.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="w-[320px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
            />

            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2E1A72] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95"
            >
              Add New Product <span className="text-lg leading-none">+</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Product ID</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Sold</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {paged.map((p) => {
              const stock = p.track_inventory === false ? 999999 : (p.stock ?? 0);
              const status = p.track_inventory === false ? { label: "Active", tone: "green" as const } : getStockStatus(stock);
              const img = getPrimaryImage(p);

              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-4 font-medium text-gray-900">P{String(p.id).padStart(3, "0")}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                        {img ? <img src={img} alt={p.name} className="h-full w-full object-cover" /> : null}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.sku ? `SKU: ${p.sku}` : p.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{formatMoney(p.price_paise, "INR")}</div>
                    {p.mrp_paise ? (
                      <div className="text-xs text-gray-500">MRP: {formatMoney(p.mrp_paise, "INR")}</div>
                    ) : null}
                  </td>

                  <td className="px-5 py-4">
                    {p.track_inventory === false ? (
                      <span className="text-gray-500">Not tracked</span>
                    ) : (
                      <span className="font-medium">{p.stock ?? 0}</span>
                    )}
                  </td>

                  <td className="px-5 py-4">{p.sold ?? 0}</td>

                  <td className="px-5 py-4">
                    <StatusPill label={status.label} tone={status.tone} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(p)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="text-sm text-gray-600">
          Page <span className="font-medium">{page}</span> / {totalPages}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      <ProductUpsertDialog
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        initial={editing}
        onSaved={(saved) => {
          setRows((cur) => {
            const idx = cur.findIndex((x) => x.id === saved.id);
            if (idx === -1) return [saved, ...cur];
            const next = [...cur];
            next[idx] = saved;
            return next;
          });
        }}
      />

      <DeleteProductDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        product={deleting}
        onDeleted={(id) => setRows((cur) => cur.filter((x) => x.id !== id))}
      />
    </div>
  );
}

// Optional: allows page.tsx to render toolbar area if you want, but not required.
// You can remove this namespace if you prefer.
ProductsTable.Toolbar = function Toolbar({ initialData }: { initialData: ProductsAdminPayload }) {
  return null;
};
