import AdminShell from "@/components/layout/AdminShell";
import BlogsTable from "@/components/blogs/BlogsTable";
import { getBlogsAdmin } from "@/lib/queries/blogs";

export default async function BlogsAdminPage() {
  const blogs = await getBlogsAdmin();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blogs</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage published and draft posts.
          </p>
        </div>
        {/* handled inside client table */}
      </div>

      <BlogsTable initialData={blogs} />
    </AdminShell>
  );
}
