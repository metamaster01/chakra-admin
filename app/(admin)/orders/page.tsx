import AdminShell from "@/components/layout/AdminShell";
import OrdersTable from "@/components/orders/OrdersTable";
import { getOrders } from "@/lib/queries/orders";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            Paid orders by shipping status + Draft orders (unpaid/incomplete).
          </p>
        </div>

        {/* No "Add Manual Order" button as requested */}
      </div>

      <OrdersTable initialData={orders} />
    </AdminShell>
  );
}
