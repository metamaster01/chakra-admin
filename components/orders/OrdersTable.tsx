"use client";

import React, { useMemo, useState } from "react";
import OrderDetailsDialog from "./OrderDetailsDialog";
import type { OrderRow } from "@/lib/queries/orders";
import { supabaseBrowser } from "@/lib/supabase-browser";

type TabKey = "all" | "completed" | "in_process" | "cancelled" | "draft";

const PAGE_SIZE = 10;

function formatOrderId(id: number) {
  return `O${String(id).padStart(4, "0")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

function formatMoney(paise: number, currency: string) {
  const amount = (paise ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

function isPaid(order: OrderRow) {
  const ps = (order.payment_status ?? "").toLowerCase();
  const st = (order.status ?? "").toLowerCase(); // your data uses this
  return ps === "paid" || st === "paid";
}


function normalizeShippingStatus(v: string | null | undefined) {
  const s = (v ?? "").toLowerCase();
  if (s === "completed") return "completed";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "inprogress" || s === "in_progress" || s === "in process" || s === "in-process") return "in_process";
  return "in_process";
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "gray" | "green" | "yellow" | "red" | "purple";
}) {
  const toneClasses =
    tone === "green"
      ? "bg-green-50 text-green-700 ring-green-200"
      : tone === "yellow"
        ? "bg-yellow-50 text-yellow-700 ring-yellow-200"
        : tone === "red"
          ? "bg-red-50 text-red-700 ring-red-200"
          : tone === "purple"
            ? "bg-purple-50 text-purple-700 ring-purple-200"
            : "bg-gray-50 text-gray-700 ring-gray-200";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClasses}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function tabButtonClass(active: boolean) {
  return active
    ? "rounded-lg bg-[#2E1A72] px-4 py-2 text-sm font-medium text-white shadow-sm"
    : "rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-gray-200";
}

export default function OrdersTable({ initialData }: { initialData: OrderRow[] }) {
  const [rows, setRows] = useState<OrderRow[]>(initialData ?? []);
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return rows.filter((o) => {
      const paid = isPaid(o);

      // Tabs logic
      if (tab === "draft") {
        if (paid) return false;
      } else {
        if (!paid) return false;

        if (tab !== "all") {
          const ss = normalizeShippingStatus(o.shipping_status);
          if (ss !== tab) return false;
        }
      }

      if (!query) return true;

      const customerName = (o.profiles?.full_name ?? "").toLowerCase();
      const email = (o.email ?? o.contact_email ?? "").toLowerCase();
      const phone = (o.phone ?? o.contact_phone ?? o.profiles?.phone ?? "").toLowerCase();
      const idStr = formatOrderId(o.id).toLowerCase();

      const itemNames = (o.order_items ?? []).map((it) => (it.name_snapshot ?? "").toLowerCase()).join(" ");

      return (
        customerName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        idStr.includes(query) ||
        itemNames.includes(query)
      );
    });
  }, [rows, tab, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function openDetails(o: OrderRow) {
    setSelected(o);
    setDialogOpen(true);
  }

  async function updateShippingStatus(orderId: number, next: "in_process" | "completed" | "cancelled") {
    setErrorMsg(null);
    setSavingId(orderId);

    // optimistic update
    const prev = rows;
    setRows((cur) => cur.map((r) => (r.id === orderId ? { ...r, shipping_status: next } : r)));

    try {
      const supabase = await (supabaseBrowser() as any);
      const { error } = await supabase
        .from("orders")
        .update({ shipping_status: next, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
    } catch (e: any) {
      setRows(prev);
      setErrorMsg(e?.message ?? "Failed to update shipping status.");
    } finally {
      setSavingId(null);
    }
  }

  // Keep page in bounds after filtering
  React.useEffect(() => {
    setPage(1);
  }, [tab, q]);

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Orders Table</h3>
            <p className="text-sm text-gray-500 mt-1">
              Paid orders by shipping status + Draft orders (unpaid/incomplete).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search orders, customer, email, phone..."
                className="w-[320px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className={tabButtonClass(tab === "all")} onClick={() => setTab("all")}>
            All
          </button>
          <button className={tabButtonClass(tab === "completed")} onClick={() => setTab("completed")}>
            Completed
          </button>
          <button className={tabButtonClass(tab === "in_process")} onClick={() => setTab("in_process")}>
            In process
          </button>
          <button className={tabButtonClass(tab === "cancelled")} onClick={() => setTab("cancelled")}>
            Cancelled
          </button>
          <button className={tabButtonClass(tab === "draft")} onClick={() => setTab("draft")}>
            Draft
          </button>

          {errorMsg ? <span className="ml-2 text-sm text-red-600">{errorMsg}</span> : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {paged.map((o) => {
              const paid = isPaid(o);

              const items = o.order_items ?? [];
              const qty = items.reduce((sum, it) => sum + (it.quantity ?? 0), 0);
              const first = items[0];
              const extraCount = Math.max(0, items.length - 1);

              const ss = normalizeShippingStatus(o.shipping_status);
              const statusTone = !paid
                ? "purple"
                : ss === "completed"
                  ? "green"
                  : ss === "cancelled"
                    ? "red"
                    : "yellow";

              const statusLabel = !paid
                ? "Draft"
                : ss === "completed"
                  ? "Completed"
                  : ss === "cancelled"
                    ? "Cancelled"
                    : "In process";

              return (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-4 font-medium text-gray-900">{formatOrderId(o.id)}</td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{o.profiles?.full_name ?? "—"}</span>
                      <span className="text-xs text-gray-500">{o.email ?? o.contact_email ?? "—"}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                        {first?.image_snapshot ? (
                          // Assumes stored snapshot is already a usable URL/path
                          // If you store a path in product_images bucket, convert in the dialog (or adjust here similarly).
                          <img
                            src={first.image_snapshot}
                            alt={first.name_snapshot ?? "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-900">
                          {first?.name_snapshot ?? "—"}{" "}
                          {extraCount > 0 ? <span className="text-xs text-gray-500">+{extraCount} more</span> : null}
                        </div>
                        <div className="text-xs text-gray-500">
                          {first?.size_snapshot ? `Size: ${first.size_snapshot}` : ""}
                          {first?.color_snapshot ? ` • Color: ${first.color_snapshot}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">{qty || "—"}</td>
                  <td className="px-5 py-4">{formatDate(o.created_at)}</td>
                  <td className="px-5 py-4">{formatMoney(o.total_paise ?? 0, o.currency ?? "INR")}</td>
                  <td className="px-5 py-4">{(o.payment_method ?? "—").toUpperCase()}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <StatusPill label={statusLabel} tone={statusTone as any} />

                      {paid ? (
                        <select
                          value={ss}
                          disabled={savingId === o.id}
                          onChange={(e) =>
                            updateShippingStatus(o.id, e.target.value as "in_process" | "completed" | "cancelled")
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#2E1A72]/20 disabled:opacity-60"
                          aria-label="Update shipping status"
                        >
                          <option value="in_process">In process</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => openDetails(o)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}

            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-gray-500">
                  No orders found.
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

        <div className="flex items-center gap-2 text-sm text-gray-600">
          {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
            const p = idx + 1;
            const active = p === page;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={active ? "font-semibold text-[#2E1A72]" : "hover:text-gray-900"}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 7 ? <span>…</span> : null}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      <OrderDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        order={selected}
        onShippingStatusUpdated={(orderId, next) => {
          setRows((cur) => cur.map((r) => (r.id === orderId ? { ...r, shipping_status: next } : r)));
        }}
      />
    </div>
  );
}
