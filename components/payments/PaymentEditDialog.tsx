"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function PaymentEditDialog({
  row, onClose, onSaved
}: { row:any; onClose:()=>void; onSaved:(r:any)=>void }) {
  const supabase = supabaseBrowser();

  const [form, setForm] = useState({
    payment_status: row.payment_status ?? "paid",
    payment_method: row.payment_method ?? "",
    status: row.status ?? "created",
    shipping_method: row.shipping_method ?? "",
    notes: row.notes ?? "",
  });

  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .update(form)
      .eq("id", row.id)
      .select(`
        id, user_id, email, phone, payment_status, payment_method,
        razorpay_payment_id, razorpay_order_id, total_paise, currency,
        status, created_at, notes, shipping_method
      `)
      .maybeSingle();

    setLoading(false);
    if (!error && data) onSaved(data);
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="bg-white w-[95%] max-w-xl rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-lg mb-4">Edit Payment</h3>

        <div className="grid gap-3 text-sm">
          <label>
            Payment Status
            <select
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.payment_status}
              onChange={(e)=>setForm(p=>({...p,payment_status:e.target.value}))}
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </label>

          <label>
            Payment Method
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.payment_method}
              onChange={(e)=>setForm(p=>({...p,payment_method:e.target.value}))}
              placeholder="upi / card / cash / cod"
            />
          </label>

          <label>
            Order Status
            <select
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.status}
              onChange={(e)=>setForm(p=>({...p,status:e.target.value}))}
            >
              <option value="created">Created</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>

          <label>
            Shipping Method
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.shipping_method}
              onChange={(e)=>setForm(p=>({...p,shipping_method:e.target.value}))}
              placeholder="standard / express"
            />
          </label>

          <label>
            Notes
            <textarea
              className="mt-1 w-full border rounded-xl px-3 py-2 h-24"
              value={form.notes}
              onChange={(e)=>setForm(p=>({...p,notes:e.target.value}))}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
          <button
            onClick={save}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[#4B2DB3] text-white"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
