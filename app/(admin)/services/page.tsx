import AdminShell from "@/components/layout/AdminShell";
import ServicesTable from "@/components/services/ServicesTable";
import { getServices } from "@/lib/queries/services";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all therapies.</p>
        </div>

        

        {/* You DO want Add new Service */}
      </div>
        <ServicesTable initialData={services} showAdd />
    </AdminShell>
  );
}
