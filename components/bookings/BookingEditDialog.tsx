"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function BookingEditDialog({
  row, onClose, onSaved
}: { row:any; onClose:()=>void; onSaved:(r:any)=>void }) {
  const supabase = supabaseBrowser();
  const [form, setForm] = useState({
    status: row.status,
    payment_status: row.payment_status,
    preferred_date: row.preferred_date ?? null,
    preferred_time: row.preferred_time ?? null,
    preferred_location: row.preferred_location ?? ""
  });
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_bookings")
      .update(form)
      .eq("id", row.id)
      .select(`
        id, contact_name, contact_email, preferred_date, preferred_time,
        preferred_location, status, payment_status, created_at,
        services(title)
      `)
      .maybeSingle();
    setLoading(false);
    if (!error && data) onSaved(data);
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="bg-white w-[90%] max-w-lg rounded-2xl p-5 shadow-xl">
        <h3 className="font-semibold text-lg mb-4">Edit Booking</h3>

        <div className="grid gap-3 text-sm">
          <label>
            Status
            <select
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.status}
              onChange={(e)=>setForm(p=>({...p, status:e.target.value}))}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label>
            Payment
            <select
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.payment_status}
              onChange={(e)=>setForm(p=>({...p, payment_status:e.target.value}))}
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>

          <label>
            Preferred Location
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.preferred_location}
              onChange={(e)=>setForm(p=>({...p, preferred_location:e.target.value}))}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
          <button onClick={save} disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#4B2DB3] text-white">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
