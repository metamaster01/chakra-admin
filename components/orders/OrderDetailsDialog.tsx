"use client";

import React, { useMemo, useState } from "react";
import type { OrderRow } from "@/lib/queries/orders";
import { supabaseBrowser } from "@/lib/supabase-browser";

function formatOrderId(id: number) {
  return `O${String(id).padStart(4, "0")}`;
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

function coerceObject(v: any): Record<string, any> | null {
  if (!v) return null;
  if (typeof v === "object" && !Array.isArray(v)) return v;
  return null;
}

// Best-effort display for address JSON (works with different shapes)
function addressRows(addr: Record<string, any>) {
  const preferredKeys = [
    "name",
    "full_name",
    "email",
    "phone",
    "line1",
    "line2",
    "address1",
    "address2",
    "street",
    "area",
    "landmark",
    "city",
    "state",
    "pincode",
    "pin",
    "zip",
    "country",
  ];

  const used = new Set<string>();
  const out: Array<[string, string]> = [];

  for (const k of preferredKeys) {
    if (k in addr) {
      used.add(k);
      const val = addr[k];
      if (val !== null && val !== undefined && String(val).trim() !== "") {
        out.push([k, String(val)]);
      }
    }
  }

  // add remaining keys (stable order)
  Object.keys(addr)
    .sort()
    .forEach((k) => {
      if (used.has(k)) return;
      const val = addr[k];
      if (val === null || val === undefined) return;
      if (typeof val === "object") return; // skip nested objects in main view
      const s = String(val).trim();
      if (!s) return;
      out.push([k, s]);
    });

  return out;
}

function resolveImageUrl(snapshot: string | null | undefined) {
  if (!snapshot) return null;
  if (snapshot.startsWith("http://") || snapshot.startsWith("https://")) return snapshot;

  // If you store storage paths (e.g. "abc.png") in snapshot, this assumes bucket is public:
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return snapshot;

  const cleaned = snapshot.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/product_images/${cleaned}`;
}

export default function OrderDetailsDialog({
  open,
  onClose,
  order,
  onShippingStatusUpdated,
}: {
  open: boolean;
  onClose: () => void;
  order: OrderRow | null;
  onShippingStatusUpdated?: (orderId: number, next: "in_process" | "completed" | "cancelled") => void;
}) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const paid = order ? isPaid(order) : false;
  const shippingStatus = order ? normalizeShippingStatus(order.shipping_status) : "in_process";

  const addrObj = useMemo(() => {
    if (!order) return null;
    return coerceObject(order.shipping_address) ?? coerceObject(order.address);
  }, [order]);

const cancelReqs = useMemo(() => {
  if (!order) return [];
  const v = (order as any)?.order_cancellation_requests;
  return Array.isArray(v) ? v : [];
}, [order]);

const latestCancel = useMemo(() => {
  if (!cancelReqs.length) return null;
  return [...cancelReqs].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
}, [cancelReqs]);

const isCancelled = order ? normalizeShippingStatus(order.shipping_status) === "cancelled" : false;



  // async function updateShipping(next: "in_process" | "completed" | "cancelled") {
  //   if (!order) return;
  //   setErr(null);
  //   setSaving(true);

  //   try {
  //     const supabase = await (supabaseBrowser() as any);
  //     const { error } = await supabase
  //       .from("orders")
  //       .update({ shipping_status: next, updated_at: new Date().toISOString() })
  //       .eq("id", order.id);

  //     if (error) throw error;
  //     onShippingStatusUpdated?.(order.id, next);
  //   } catch (e: any) {
  //     setErr(e?.message ?? "Failed to update shipping status.");
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  async function updateShipping(next: "in_process" | "completed" | "cancelled") {
  if (!order) return;
  setErr(null);
  setSaving(true);

  try {
    const supabase = await (supabaseBrowser() as any);

    const { error: upErr } = await supabase
      .from("orders")
      .update({ shipping_status: next, updated_at: new Date().toISOString() })
      .eq("id", order.id);

    if (upErr) throw upErr;

    if (next === "cancelled") {
      const reason = "Cancelled by Admin";

      // best effort: don't spam duplicates
      const existing = Array.isArray((order as any)?.order_cancellation_requests)
        ? (order as any).order_cancellation_requests
        : [];
      const already = existing.some(
        (r: any) => String(r?.reason || "").toLowerCase() === reason.toLowerCase()
      );

      if (!already) {
        const { error: insErr } = await supabase
          .from("order_cancellation_requests")
          .insert({ order_id: order.id, user_id: null, reason, status: "approved" });

        if (insErr) throw insErr;
      }
    }

    onShippingStatusUpdated?.(order.id, next);
  } catch (e: any) {
    setErr(e?.message ?? "Failed to update shipping status.");
  } finally {
    setSaving(false);
  }
}


  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 w-[min(920px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order {formatOrderId(order.id)}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {paid ? "Paid order" : "Draft order"} • {new Date(order.created_at).toLocaleString("en-IN")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {err ? <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Customer</h4>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div className="font-medium text-gray-900">{order.profiles?.full_name ?? "—"}</div>
                <div>{order.email ?? order.contact_email ?? "—"}</div>
                <div>{order.phone ?? order.contact_phone ?? order.profiles?.phone ?? "—"}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Payment</h4>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500">Status:</span> <span className="font-medium">{order.payment_status ?? "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Method:</span> <span className="font-medium">{order.payment_method ?? "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>{" "}
                  <span className="font-semibold text-gray-900">{formatMoney(order.total_paise ?? 0, order.currency ?? "INR")}</span>
                </div>
                {order.razorpay_payment_id ? (
                  <div className="break-all">
                    <span className="text-gray-500">RZP Payment:</span> {order.razorpay_payment_id}
                  </div>
                ) : null}
                {order.razorpay_order_id ? (
                  <div className="break-all">
                    <span className="text-gray-500">RZP Order:</span> {order.razorpay_order_id}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Shipping</h4>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500">Method:</span> <span className="font-medium">{order.shipping_method ?? "—"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium">{paid ? shippingStatus.replace("_", " ") : "draft"}</span>
                </div>

                {paid ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={shippingStatus}
                      disabled={saving}
                      onChange={(e) => updateShipping(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20 disabled:opacity-60"
                    >
                      <option value="in_process">In process</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Shipping status is only for paid orders.</div>
                )}
              </div>
            </div>



            
          </div>

          

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Address</h4>
              {addrObj ? (
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  {addressRows(addrObj).map(([k, v]) => (
                    <div key={k} className="col-span-2 sm:col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{k.replace(/_/g, " ")}</div>
                      <div className="mt-1 text-gray-800">{v}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-gray-500">No address found on this order.</div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
              <div className="mt-3 text-sm text-gray-700">{order.notes?.trim() ? order.notes : "—"}</div>
              <div className="mt-4 text-xs text-gray-500">
                Internal status: <span className="font-medium">{order.status}</span>
              </div>
            </div>
          </div>


          {isCancelled ? (
  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
    <h4 className="text-sm font-semibold text-red-900">Cancellation</h4>
    {latestCancel ? (
      <div className="mt-2 text-sm text-red-800 space-y-1">
        <div>
          <span className="font-medium">Reason:</span> {latestCancel.reason}
        </div>
        <div className="text-xs text-red-900/70">
          Logged: {new Date(latestCancel.created_at).toLocaleString("en-IN")}
        </div>
      </div>
    ) : (
      <div className="mt-2 text-sm text-red-800">
        Cancelled, but no reason found.
      </div>
    )}
  </div>
) : null}


          <div className="mt-5 rounded-2xl border border-gray-100">
            <div className="border-b border-gray-100 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-900">Items</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr className="border-b border-gray-50">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Variant</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Line Total</th>
                  </tr>
                </thead>

                <tbody>
                  {(order.order_items ?? []).map((it) => {
                    const img = resolveImageUrl(it.image_snapshot);
                    const unit = formatMoney(it.unit_price_paise ?? 0, order.currency ?? "INR");
                    const line = formatMoney((it.line_total_paise ?? it.unit_price_paise * it.quantity) ?? 0, order.currency ?? "INR");

                    return (
                      <tr key={it.id} className="border-b border-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                              {img ? <img src={img} alt={it.name_snapshot} className="h-full w-full object-cover" /> : null}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium text-gray-900">{it.name_snapshot ?? "—"}</div>
                              <div className="text-xs text-gray-500">Product ID: {it.product_id ?? "—"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-gray-700">
                          <div className="text-sm">
                            {it.size_snapshot ? `Size: ${it.size_snapshot}` : "—"}
                            {it.color_snapshot ? ` • Color: ${it.color_snapshot}` : ""}
                          </div>
                          <div className="text-xs text-gray-500">Variant ID: {it.variant_id ?? "—"}</div>
                        </td>

                        <td className="px-4 py-4">{it.quantity}</td>
                        <td className="px-4 py-4">{unit}</td>
                        <td className="px-4 py-4 font-semibold text-gray-900">{line}</td>
                      </tr>
                    );
                  })}

                  {(order.order_items ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No items found for this order.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}



