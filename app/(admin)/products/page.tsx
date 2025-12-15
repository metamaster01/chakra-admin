import AdminShell from "@/components/layout/AdminShell";
import ProductsTable from "@/components/products/ProductsTable";
import { getProductsAdmin } from "@/lib/queries/products";

export default async function ProductsPage() {
  const data = await getProductsAdmin();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage products, variants and images.
          </p>
        </div>

        {/* Only Add New Product button (no View Store) */}
        {/* <ProductsTable.Toolbar initialData={data} /> */}
      </div>

      <ProductsTable initialData={data} />
    </AdminShell>
  );
}
