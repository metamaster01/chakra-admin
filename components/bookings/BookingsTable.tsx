"use client";

import { useState } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import BookingEditDialog from "./BookingEditDialog";
import BookingStatusBadge from "./BookingStatusBadge";
import { supabaseBrowser } from "@/lib/supabase-browser";
import BookingViewDialog from "./BookingViewDialog";

export default function BookingsTable({ initialData }: { initialData: any[] }) {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState(initialData);
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left py-2">Booking ID</th>
              <th className="text-left py-2">Client Name</th>
              <th className="text-left py-2">Client Number</th>

              <th className="text-left py-2">Service</th>
              <th className="text-left py-2">Date & Time</th>
              <th className="text-left py-2">Payment</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((b: any) => (
              <tr key={b.id} className="border-t">
                <td className="py-3 font-medium">{`B${String(b.id).padStart(
                  4,
                  "0"
                )}`}</td>
                <td className="py-3">{b.contact_name}</td>
                <td className="py-3">{b.contact_phone || "—"}</td>

                <td className="py-3">
                  {b.services?.title || b.other_therapy || "—"}
                </td>
                <td className="py-3">
                  {b.preferred_date
                    ? new Date(b.preferred_date).toLocaleDateString()
                    : "—"}
                  {b.preferred_time ? `, ${b.preferred_time}` : ""}
                </td>
                <td className="py-3">
                  <BookingStatusBadge type="payment" value={b.payment_status} />
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

            {rows.length === 0 && (
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
  <BookingViewDialog
    row={viewRow}
    onClose={() => setViewRow(null)}
  />
)}

    </div>
  );
}
