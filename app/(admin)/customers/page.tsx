import AdminShell from "@/components/layout/AdminShell";
import CustomersTable from "@/components/customers/CustomersTable";
import { getCustomers } from "@/lib/queries/customers";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-500 mt-1">All users from profiles.</p>
        </div>
        {/* you said no Add Customer button */}
      </div>

      <CustomersTable initialData={customers} />
    </AdminShell>
  );
}
