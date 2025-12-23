"use client";

import { useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import BookingEditDialog from "./BookingEditDialog";
import BookingStatusBadge from "./BookingStatusBadge";
import { supabaseBrowser } from "@/lib/supabase-browser";
import BookingViewDialog from "./BookingViewDialog";

function bookingServiceSummary(b: any) {
  const items = Array.isArray(b.service_booking_items)
    ? b.service_booking_items
    : [];
  if (!items.length) return b.other_therapy || "—";

  // show first + count
  const first =
    items[0]?.title_snapshot || items[0]?.services?.title || "Service";
  if (items.length === 1) return `${first} × ${items[0].quantity ?? 1}`;
  return `${first} + ${items.length - 1} more`;
}

function bookingTotalQty(b: any) {
  const items = Array.isArray(b.service_booking_items)
    ? b.service_booking_items
    : [];
  return items.reduce(
    (sum: number, it: any) => sum + Number(it.quantity || 0),
    0
  );
}

export default function BookingsTable({ initialData }: { initialData: any[] }) {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState(initialData);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "inprocess" | "cancelled"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );

  function norm(v: any) {
    return String(v ?? "")
      .toLowerCase()
      .trim();
  }

  function matchesSearch(b: any, query: string) {
    if (!query) return true;
    const s = query.toLowerCase().trim();

    const items = Array.isArray(b.service_booking_items)
      ? b.service_booking_items
      : [];
    const itemsText = items
      .map(
        (it: any) =>
          `${it.title_snapshot ?? ""} ${it.services?.title ?? ""} ${
            it.quantity ?? ""
          }`
      )
      .join(" ");

    const hay = [
      `b${String(b.id ?? "")}`,
      b.id,
      b.contact_name,
      b.contact_email,
      b.contact_phone,
      b.preferred_date,
      b.preferred_slot,
      b.preferred_location,
      b.status,
      b.payment_status,
      b.razorpay_order_id,
      b.razorpay_payment_id,
      itemsText,
    ]
      .map(norm)
      .join(" ");

    return hay.includes(s);
  }

  const filteredRows = rows.filter((b: any) => {
    const st = norm(b.status);
    const ps = norm(b.payment_status);

    const okStatus = statusFilter === "all" ? true : st === statusFilter;
    const okPay = paymentFilter === "all" ? true : ps === paymentFilter;

    return okStatus && okPay && matchesSearch(b, q);
  });

  const [editRow, setEditRow] = useState<any | null>(null);
  const [viewRow, setViewRow] = useState<any | null>(null);

  async function del(id: number) {
    const { error } = await supabase
      .from("service_bookings")
      .delete()
      .eq("id", id);
    if (!error) setRows((p) => p.filter((r) => r.id !== id));
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Bookings Table</h4>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search booking id, name, email, phone, service…"
            className="w-full rounded-xl border border-purple-100 bg-white px-4 py-2.5 text-sm outline-none
                 focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="inprocess">In Process</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatusFilter("all");
              setPaymentFilter("all");
            }}
            className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm hover:bg-purple-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left py-2">Booking ID</th>
              <th className="text-left py-2">Client Name</th>
              <th className="text-left py-2">Client Number</th>

              <th className="text-left py-2">Service</th>
              <th className="text-left py-2">Date & Time Slot</th>
              <th className="text-left py-2">Qty</th>

              <th className="text-left py-2">Payment</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2"></th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((b: any) => (
              <tr key={b.id} className="border-t">
                <td className="py-3 font-medium">{`B${String(b.id).padStart(
                  4,
                  "0"
                )}`}</td>
                <td className="py-3">{b.contact_name}</td>
                <td className="py-3">{b.contact_phone || "—"}</td>

                {/* <td className="py-3">
                  {b.services?.title_snapshot || b.other_therapy || "—"}
                </td> */}

                <td className="py-3">{bookingServiceSummary(b)}</td>

                <td className="py-3">
                  {b.preferred_date
                    ? new Date(b.preferred_date).toLocaleDateString()
                    : "—"}
                  {b.preferred_slot ? `, ${b.preferred_slot}` : ""}
                </td>
                <td className="py-3">{bookingTotalQty(b)}</td>

                <td className="py-3">
                  <BookingStatusBadge type="payment" value={b.payment_status} />
                </td>
                <td className="py-3">
                  {b.service_price_paise
                    ? `${b.service_price_paise / 100} INR`
                    : "—"}
                </td>
                <td className="py-3">
                  <BookingStatusBadge type="status" value={b.status} />
                </td>
                <td className="py-3 flex gap-2">
                  <button
                    onClick={() => setViewRow(b)}
                    className="p-2 rounded-lg hover:bg-purple-50"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => setEditRow(b)}
                    className="p-2 rounded-lg hover:bg-purple-50"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => del(b.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editRow && (
        <BookingEditDialog
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={(upd: any) => {
            setRows((p) => p.map((r) => (r.id === upd.id ? upd : r)));
            setEditRow(null);
          }}
        />
      )}

      {viewRow && (
        <BookingViewDialog row={viewRow} onClose={() => setViewRow(null)} />
      )}
    </div>
  );
}
