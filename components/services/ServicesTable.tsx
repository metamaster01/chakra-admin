"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import ServiceUpsertDialog from "./ServiceUpsertDialog";
import ServiceStatusBadge from "./ServiceStatusBadge";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ServicesTable({
  initialData,
  showAdd = false,
}: {
  initialData: any[];
  showAdd?: boolean;
}) {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState(initialData);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  async function del(id: number) {
    // delete children first (benefits, images)
    await supabase.from("service_benefits").delete().eq("service_id", id);
    // await supabase.from("service_images").delete().eq("service_id", id);
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) setRows((p) => p.filter((r) => r.id !== id));
  }

  return (
    <div className="w-full">
      {showAdd && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={() => setOpenAdd(true)}
            className="px-4 py-2 rounded-xl bg-[#4B2DB3] text-white text-sm shadow flex items-center gap-2"
          >
            <Plus size={16} /> Add new Service
          </button>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Services Table</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500">
              <tr>
                <th className="text-left py-2">Service ID</th>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Slug</th>
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Short Desc</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2"></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((s: any) => (
                <tr key={s.id} className="border-t">
                  <td className="py-3 font-medium">{`S${String(s.id).padStart(
                    3,
                    "0"
                  )}`}</td>
                  <td className="py-3">{s.title}</td>
                  <td className="py-3">{s.slug}</td>
                  <td className="py-3">{s.price_paise}</td>
                  <td className="py-3 truncate max-w-[220px]">
                    {s.short_desc || "—"}
                  </td>
                  <td className="py-3">
                    <ServiceStatusBadge active={s.is_active} />
                  </td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => setEditRow(s)}
                      className="p-2 rounded-lg hover:bg-purple-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => del(s.id)}
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
                    No services yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(openAdd || editRow) && (
        <ServiceUpsertDialog
          initial={editRow}
          onClose={() => {
            setOpenAdd(false);
            setEditRow(null);
          }}
          onSaved={(saved: any) => {
            setRows((p) => {
              const exists = p.some((x) => x.id === saved.id);
              return exists
                ? p.map((x) => (x.id === saved.id ? saved : x))
                : [saved, ...p];
            });
            setOpenAdd(false);
            setEditRow(null);
          }}
        />
      )}
    </div>
  );
}
