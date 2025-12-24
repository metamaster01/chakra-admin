// export default function UpcomingAppointmentsTable({ data }: { data: any[] }) {
//   return (
//     <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h4 className="font-semibold text-gray-900">Upcoming Appointments</h4>
//         <div className="flex gap-2">
//           <input
//             className="border rounded-xl px-3 py-2 text-sm bg-white"
//             placeholder="Search"
//           />
//           <button className="border rounded-xl px-3 py-2 text-sm bg-white">
//             Filters
//           </button>
//           <button className="rounded-xl px-3 py-2 text-sm bg-[#4B2DB3] text-white">
//             + Add new appointment
//           </button>
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="text-gray-500">
//             <tr>
//               <th className="text-left py-2">Date</th>
//               <th className="text-left py-2">Client Name</th>
//               <th className="text-left py-2">Service</th>
//               <th className="text-left py-2">Therapist</th>
//               <th className="text-left py-2">Time</th>
//               <th className="text-left py-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((b) => (
//               <tr key={b.id} className="border-t">
//                 <td className="py-3">
//                   {new Date(b.start_time).toLocaleDateString()}
//                 </td>
//                 <td className="py-3">{b.contact_name || "—"}</td>
//                 <td className="py-3">{b.services?.title || "—"}</td>
//                 <td className="py-3">{b.staff?.name || "—"}</td>
//                 <td className="py-3">
//                   {new Date(b.start_time).toLocaleTimeString()} -{" "}
//                   {new Date(b.end_time).toLocaleTimeString()}
//                 </td>
//                 <td className="py-3">
//                   <span className={`px-2 py-1 rounded-full text-xs
//                     ${b.status === "completed" ? "bg-green-100 text-green-800" :
//                       b.status === "pending" ? "bg-yellow-100 text-yellow-800" :
//                       "bg-gray-100 text-gray-700"}`}>
//                     {b.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




"use client";

import { useMemo, useState } from "react";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";

function bookingServiceSummary(b: any) {
  const items = Array.isArray(b.service_booking_items) ? b.service_booking_items : [];
  if (!items.length) return b.other_therapy || "—";
  const first = items[0]?.title_snapshot || items[0]?.services?.title || "Service";
  if (items.length === 1) return `${first} × ${items[0].quantity ?? 1}`;
  return `${first} + ${items.length - 1} more`;
}

function bookingTotalQty(b: any) {
  const items = Array.isArray(b.service_booking_items) ? b.service_booking_items : [];
  return items.reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0);
}

function norm(v: any) {
  return String(v ?? "").toLowerCase().trim();
}

function matchesSearch(b: any, query: string) {
  if (!query) return true;
  const s = query.toLowerCase().trim();

  const items = Array.isArray(b.service_booking_items) ? b.service_booking_items : [];
  const itemsText = items
    .map((it: any) => `${it.title_snapshot ?? ""} ${it.services?.title ?? ""} ${it.quantity ?? ""}`)
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
    itemsText,
  ].map(norm).join(" ");

  return hay.includes(s);
}

export default function UpcomingAppointmentsTable({ data }: { data: any[] }) {
  const [rows] = useState<any[]>(data ?? []);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "inprocess" | "cancelled"
  >("confirmed");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("paid");

  const filteredRows = useMemo(() => {
    return rows.filter((b: any) => {
      const st = norm(b.status);
      const ps = norm(b.payment_status);

      const okStatus = statusFilter === "all" ? true : st === statusFilter;
      const okPay = paymentFilter === "all" ? true : ps === paymentFilter;

      return okStatus && okPay && matchesSearch(b, q);
    });
  }, [rows, q, statusFilter, paymentFilter]);

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Upcoming Appointments</h4>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-purple-100 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Search name, phone, service..."
          />

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
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Slot</th>
              <th className="text-left py-2">Client</th>
              <th className="text-left py-2">Phone</th>
              <th className="text-left py-2">Service</th>
              <th className="text-left py-2">Qty</th>
              <th className="text-left py-2">Payment</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((b: any) => (
              <tr key={b.id} className="border-t">
                <td className="py-3">
                  {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="py-3">{b.preferred_slot || "—"}</td>
                <td className="py-3">{b.contact_name || "—"}</td>
                <td className="py-3">{b.contact_phone || "—"}</td>
                <td className="py-3">{bookingServiceSummary(b)}</td>
                <td className="py-3">{bookingTotalQty(b)}</td>
                <td className="py-3">
                  <BookingStatusBadge type="payment" value={b.payment_status} />
                </td>
                <td className="py-3">
                  <BookingStatusBadge type="status" value={b.status} />
                </td>
              </tr>
            ))}

            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-500">
                  No upcoming appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
