"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import CustomerEditDialog from "./CustomerEditDialog";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Pencil, Trash2 } from "lucide-react";

export default function CustomersTable({ initialData }: { initialData: any[] }) {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState(initialData);
  const [editRow, setEditRow] = useState<any | null>(null);

  async function deleteCustomer(userId: string) {
    // delete only profiles row (auth user stays unless you create an admin delete-user function later)
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (!error) setRows(prev => prev.filter(r => r.user_id !== userId));
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      <h4 className="font-semibold text-gray-900 mb-3">Customers Table</h4>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left py-2">Customer ID</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Phone</th>
              <th className="text-left py-2">Total Sessions</th>
              <th className="text-left py-2">Last Visit</th>
              <th className="text-left py-2">Total Spent</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((c, i) => (
              <tr key={c.user_id} className="border-t">
                <td className="py-3 font-medium">
                  {`C${String(i + 1).padStart(3, "0")}`}
                </td>
                <td className="py-3">{c.full_name || "—"}</td>
                <td className="py-3">{c.email || "—"}</td>
                <td className="py-3">{c.phone || "—"}</td>
                <td className="py-3">{c.total_sessions}</td>
                <td className="py-3">
                  {c.last_visit ? new Date(c.last_visit).toLocaleDateString() : "—"}
                </td>
                <td className="py-3">
                  ₹{(c.total_spent_paise / 100).toLocaleString("en-IN")}
                </td>
                <td className="py-3">
                  <StatusBadge status={c.total_sessions > 0 ? "active" : "inactive"} />
                </td>
                <td className="py-3 flex gap-2">
                  <button
                    onClick={() => setEditRow(c)}
                    className="p-2 rounded-lg hover:bg-purple-50"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteCustomer(c.user_id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr><td colSpan={9} className="py-6 text-center text-gray-500">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editRow && (
        <CustomerEditDialog
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={(updated) => {
            setRows(prev => prev.map(r => r.user_id === updated.user_id ? updated : r));
            setEditRow(null);
          }}
        />
      )}
    </div>
  );
}
