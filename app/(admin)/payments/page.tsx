import AdminShell from "@/components/layout/AdminShell";
import PaymentsTable from "@/components/payments/PaymentsTable";
import { getPayments } from "@/lib/queries/payments";

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment & Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Successful payments received via Razorpay / COD.
          </p>
        </div>

        {/* You said keep Add Manual Payment button later, so not adding now */}
      </div>

      <PaymentsTable initialData={payments} />
    </AdminShell>
  );
}
