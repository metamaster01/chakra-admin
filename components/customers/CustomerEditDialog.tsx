"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function CustomerEditDialog({
  row, onClose, onSaved
}: { row:any; onClose:()=>void; onSaved:(r:any)=>void }) {
  const supabase = supabaseBrowser();
  const [form, setForm] = useState({
    full_name: row.full_name ?? "",
    phone: row.phone ?? "",
    avatar_url: row.avatar_url ?? "",
    // if you later add more fields in profiles, put them here
  });
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", row.user_id)
      .select("*")
      .maybeSingle();
    setLoading(false);
    if (!error && data) onSaved({ ...row, ...data });
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="bg-white w-[90%] max-w-lg rounded-2xl p-5 shadow-xl">
        <h3 className="font-semibold text-lg mb-4">Edit Customer</h3>

        <div className="grid gap-3">
          <label className="text-sm">
            Name
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.full_name}
              onChange={(e)=>setForm(p=>({...p, full_name:e.target.value}))}
            />
          </label>
          <label className="text-sm">
            Phone
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.phone}
              onChange={(e)=>setForm(p=>({...p, phone:e.target.value}))}
            />
          </label>
          <label className="text-sm">
            Avatar URL
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={form.avatar_url}
              onChange={(e)=>setForm(p=>({...p, avatar_url:e.target.value}))}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
          <button
            onClick={save}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#4B2DB3] text-white"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
