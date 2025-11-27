"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ProfileForm({ initialProfile }: { initialProfile: any }) {
  const supabase = supabaseBrowser();

  const [form, setForm] = useState({
    full_name: initialProfile?.full_name ?? "",
    email: initialProfile?.email ?? "",
    phone: initialProfile?.phone ?? "",
    dob: initialProfile?.dob ?? "",
    present_address: initialProfile?.present_address ?? "",
    permanent_address: initialProfile?.permanent_address ?? "",
    city: initialProfile?.city ?? "",
    postal_code: initialProfile?.postal_code ?? "",
    country: initialProfile?.country ?? ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function updateField(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;

    // only update fields that exist in profiles
    const payload: any = { ...form };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", uid);

    setLoading(false);
    setMsg(error ? error.message : "Profile saved ✅");
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Edit Profile</h3>

      <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Your Name" value={form.full_name} onChange={v => updateField("full_name", v)} />
        <Input label="Email" value={form.email} onChange={v => updateField("email", v)} />

        <Input label="Phone" value={form.phone} onChange={v => updateField("phone", v)} />
        <Input label="Date of Birth" type="date" value={form.dob} onChange={v => updateField("dob", v)} />

        <Input label="Present Address" value={form.present_address} onChange={v => updateField("present_address", v)} />
        <Input label="Permanent Address" value={form.permanent_address} onChange={v => updateField("permanent_address", v)} />

        <Input label="City" value={form.city} onChange={v => updateField("city", v)} />
        <Input label="Postal Code" value={form.postal_code} onChange={v => updateField("postal_code", v)} />

        <Input label="Country" value={form.country} onChange={v => updateField("country", v)} />

        <div className="md:col-span-2 flex items-center justify-between mt-2">
          {msg && <p className="text-sm text-gray-600">{msg}</p>}
          <button
            disabled={loading}
            className="ml-auto px-6 py-2 rounded-xl bg-[#4B2DB3] text-white text-sm font-semibold shadow hover:bg-[#3b2390] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label, value, onChange, type="text"
}: { label:string; value:string; onChange:(v:string)=>void; type?:string }) {
  return (
    <label className="text-sm">
      <span className="text-gray-700 font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 bg-white"
      />
    </label>
  );
}
