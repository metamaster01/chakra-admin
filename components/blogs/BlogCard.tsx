"use client";

import Link from "next/link";
import BlogStatusBadge from "./BlogStatusBadge";
import { Pencil, Eye, Trash2 } from "lucide-react";

const publicBlogImageUrl = (path?: string | null) =>
  path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-image/${path}`
    : "";

export default function BlogCard({
  blog,
  onEdit,
  onDelete,
}: {
  blog: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const thumb = publicBlogImageUrl(blog.thumb_path || blog.hero_path);

  return (
    <div className="rounded-2xl border bg-white p-3 shadow-sm hover:shadow-md transition">
      {thumb && (
        <img
          src={thumb}
          className="w-full h-40 object-cover rounded-xl mb-3"
          alt={blog.title}
        />
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold line-clamp-2">{blog.title}</h3>
          <BlogStatusBadge published={blog.published} featured={blog.featured} />
        </div>

        <p className="text-xs text-gray-500">
          {new Date(blog.created_at).toLocaleDateString()} •{" "}
          {blog.read_minutes ?? 3} min
        </p>
        {blog.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2">{blog.excerpt}</p>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={onEdit} className="flex-1 text-xs px-2 py-2 rounded-lg border hover:bg-purple-50 flex items-center justify-center gap-1">
          <Pencil size={14}/> Edit
        </button>

        <Link href={`/blogs/${blog.slug}`} className="flex-1 text-xs px-2 py-2 rounded-lg border hover:bg-purple-50 flex items-center justify-center gap-1">
          <Eye size={14}/> View
        </Link>

        <button onClick={onDelete} className="flex-1 text-xs px-2 py-2 rounded-lg border hover:bg-red-50 text-red-600 flex items-center justify-center gap-1">
          <Trash2 size={14}/> Delete
        </button>
      </div>
    </div>
  );
}
