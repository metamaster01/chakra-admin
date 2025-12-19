"use client";

import BookingStatusBadge from "./BookingStatusBadge";

const inr = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    (paise || 0) / 100
  );

function shortId(v: string | null | undefined) {
  if (!v) return "—";
  if (v.length <= 12) return v;
  return `${v.slice(0, 6)}…${v.slice(-6)}`;
}

function safeObj(v: any) {
  if (!v) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return null;
}

export default function BookingViewDialog({
  row,
  onClose,
}: {
  row: any;
  onClose: () => void;
}) {
  if (!row) return null;

  const addr = safeObj(row.address);
  const serviceTitle = row.services?.title || row.other_therapy || "—";
  const isCancelled = String(row.status || "").toLowerCase() === "cancelled";

  const latestCancel =
    Array.isArray(row.booking_cancellation_requests) &&
    row.booking_cancellation_requests.length
      ? row.booking_cancellation_requests[0]
      : null;

  const payments = Array.isArray(row.service_booking_payments)
    ? row.service_booking_payments
    : [];
  const latestPay = payments.length ? payments[0] : null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(920px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Booking {`B${String(row.id).padStart(4, "0")}`}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{serviceTitle}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Client</h4>
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <div className="font-medium text-gray-900">
                  {row.contact_name}
                </div>
                <div>{row.contact_email || "—"}</div>
                <div>{row.contact_phone || "—"}</div>
                <div className="pt-2 text-xs text-gray-500">
                  user_id: {row.user_id || "— (guest)"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Schedule</h4>
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="text-gray-500">Date:</span>{" "}
                  {row.preferred_date || "—"}
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>{" "}
                  {row.preferred_time || "—"}
                </div>
                <div>
                  <span className="text-gray-500">Timezone:</span>{" "}
                  {row.timezone || "—"}
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>{" "}
                  {row.preferred_location || "—"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Status</h4>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Booking</div>
                  <BookingStatusBadge type="status" value={row.status} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Payment</div>
                  <BookingStatusBadge
                    type="payment"
                    value={row.payment_status}
                  />
                </div>
                <div className="pt-2 text-xs text-gray-500">
                  Created:{" "}
                  {row.created_at
                    ? new Date(row.created_at).toLocaleString("en-IN")
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Payment history Area  */}

          {/* Payment Details + History */}
          <div className="rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Payment details
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Snapshot + payment attempts (Razorpay).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <BookingStatusBadge type="payment" value={row.payment_status} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-xl border border-gray-100 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Amount
                </div>
                <div className="mt-1 font-semibold text-gray-900">
                  {row.service_price_paise != null
                    ? inr(Number(row.service_price_paise))
                    : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {row.currency || "INR"}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Method
                </div>
                <div className="mt-1 font-semibold text-gray-900">
                  {row.payment_method || "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Paid at:{" "}
                  {row.paid_at
                    ? new Date(row.paid_at).toLocaleString("en-IN")
                    : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Razorpay
                </div>
                <div className="mt-1 text-gray-800">
                  <div>
                    <span className="text-gray-500">Order:</span>{" "}
                    {shortId(row.razorpay_order_id)}
                  </div>
                  <div className="mt-1">
                    <span className="text-gray-500">Payment:</span>{" "}
                    {shortId(row.razorpay_payment_id)}
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  Payment history
                </div>
                <div className="text-xs text-gray-500">
                  {payments.length} attempt(s)
                </div>
              </div>

              {payments.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-gray-500">
                      <tr className="border-b">
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Amount</th>
                        <th className="text-left py-2">Provider</th>
                        <th className="text-left py-2">RZP Order</th>
                        <th className="text-left py-2">RZP Payment</th>
                        <th className="text-left py-2">Created</th>
                        <th className="text-left py-2">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p: any, idx: number) => (
                        <tr
                          key={`${p.razorpay_order_id ?? "pay"}-${idx}`}
                          className="border-b last:border-b-0"
                        >
                          <td className="py-2">
                            <span
                              className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold
                    bg-gray-50 text-gray-700 ring-1 ring-gray-200"
                            >
                              {p.status || "—"}
                            </span>
                          </td>
                          <td className="py-2 font-medium text-gray-900">
                            {inr(Number(p.amount_paise || 0))}
                          </td>
                          <td className="py-2 text-gray-700">
                            {p.provider || "razorpay"}
                          </td>
                          <td className="py-2 text-gray-700">
                            {shortId(p.razorpay_order_id)}
                          </td>
                          <td className="py-2 text-gray-700">
                            {shortId(p.razorpay_payment_id)}
                          </td>
                          <td className="py-2 text-gray-600">
                            {p.created_at
                              ? new Date(p.created_at).toLocaleString("en-IN")
                              : "—"}
                          </td>
                          <td className="py-2 text-gray-600">
                            {p.updated_at
                              ? new Date(p.updated_at).toLocaleString("en-IN")
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                  No payment attempts found.
                </div>
              )}
            </div>
          </div>

          {isCancelled ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <h4 className="text-sm font-semibold text-red-900">
                Cancellation
              </h4>
              {latestCancel ? (
                <div className="mt-2 text-sm text-red-800 space-y-1">
                  <div>
                    <span className="font-medium">Reason:</span>{" "}
                    {latestCancel.reason}
                  </div>
                  <div className="text-xs text-red-900/70">
                    Requested:{" "}
                    {new Date(latestCancel.created_at).toLocaleString("en-IN")}
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-red-800">
                  Cancelled, but no reason was found.
                </div>
              )}
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-100 p-4">
            <h4 className="text-sm font-semibold text-gray-900">Address</h4>
            {addr ? (
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {Object.entries(addr).map(([k, v]) => (
                  <div key={k} className="col-span-2 sm:col-span-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {String(k).replaceAll("_", " ")}
                    </div>
                    <div className="mt-1 text-gray-800">{String(v)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">
                No address provided.
              </div>
            )}
          </div>

          {row.notes ? (
            <div className="rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
              <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {row.notes}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
