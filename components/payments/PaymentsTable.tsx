"use client";

import { useMemo, useState } from "react";
import PaymentEditDialog from "./PaymentEditDialog";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Pencil, Trash2 } from "lucide-react";

type Tab = "all" | "paid" | "pending" | "refunded";

export default function PaymentsTable({ initialData }: { initialData: any[] }) {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState(initialData);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let data = rows;

    if (tab !== "all") {
      if (tab === "paid")
        data = data.filter((r) => r.payment_status === "paid");
      if (tab === "pending")
        data = data.filter((r) => r.payment_status === "unpaid");
      if (tab === "refunded")
        data = data.filter((r) => r.status === "refunded");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          (r.email || "").toLowerCase().includes(q) ||
          (r.phone || "").toLowerCase().includes(q) ||
          String(r.id).includes(q) ||
          (r.razorpay_payment_id || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [rows, tab, search]);

  async function del(id: number) {
    // deleting paid orders is risky; keep feature but you can remove later
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (!error) setRows((p) => p.filter((r) => r.id !== id));
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
            All
          </TabBtn>
          <TabBtn active={tab === "paid"} onClick={() => setTab("paid")}>
            Paid
          </TabBtn>
          <TabBtn active={tab === "pending"} onClick={() => setTab("pending")}>
            Pending
          </TabBtn>
          <TabBtn
            active={tab === "refunded"}
            onClick={() => setTab("refunded")}
          >
            Refunded
          </TabBtn>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            className="w-full md:w-72 border rounded-xl px-3 py-2 text-sm"
            placeholder="Search by email, phone, order id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left py-2">Transaction ID</th>
              <th className="text-left py-2">Client</th>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2">Method</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2"></th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o: any, i: number) => (
              <tr key={o.id} className="border-t">
                <td className="py-3 font-medium">
                  {o.razorpay_payment_id
                    ? `RP-${o.razorpay_payment_id.slice(-6)}`
                    : `T${String(o.id).padStart(3, "0")}`}
                </td>

                <td className="py-3">
                  <div className="font-medium">
                    {o.profiles?.full_name || o.email || o.contact_email || "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {o.email || o.contact_email || ""}
                    {o.phone || o.contact_phone
                      ? ` • ${o.phone || o.contact_phone}`
                      : ""}
                  </div>
                </td>

                <td className="py-3">
                  {o.created_at
                    ? new Date(o.created_at).toLocaleDateString()
                    : "—"}
                </td>

                <td className="py-3">
                  ₹{(o.total_paise / 100).toLocaleString("en-IN")}
                </td>

                <td className="py-3">{o.payment_method || "COD"}</td>

                <td className="py-3">
                  <PaymentStatusBadge status={o.payment_status} />
                </td>

                <td className="py-3 flex gap-2">
                  <button
                    onClick={() => setEditRow(o)}
                    className="p-2 rounded-lg hover:bg-purple-50"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => del(o.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editRow && (
        <PaymentEditDialog
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={(upd) => {
            setRows((p) => p.map((r) => (r.id === upd.id ? upd : r)));
            setEditRow(null);
          }}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-medium border
        ${
          active
            ? "bg-[#4B2DB3] text-white border-[#4B2DB3]"
            : "bg-white text-gray-700"
        }`}
    >
      {children}
    </button>
  );
}
