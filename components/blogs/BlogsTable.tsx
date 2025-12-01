"use client";

import { useMemo, useState } from "react";
import BlogCard from "./BlogCard";
import BlogUpsertDialog from "./BlogUpsertDialog";
import { supabaseBrowser } from "@/lib/supabase-browser";

type SortKey = "newest" | "oldest" | "featured";

export default function BlogsTable({ initialData }: { initialData: any[] }) {
  const supabase = supabaseBrowser();

  const [rows, setRows] = useState(initialData);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [editRow, setEditRow] = useState<any | null>(null);
  const [openNew, setOpenNew] = useState(false);

  const filtered = useMemo(() => {
    let data = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((b) =>
        (b.title || "").toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        (b.slug || "").toLowerCase().includes(q)
      );
    }

    if (sort === "newest") {
      data = [...data].sort(
        (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
      );
    }
    if (sort === "oldest") {
      data = [...data].sort(
        (a, b) => +new Date(a.created_at) - +new Date(b.created_at)
      );
    }
    if (sort === "featured") {
      data = [...data].sort((a, b) => {
        const ar = a.featured_rank ?? 9999;
        const br = b.featured_rank ?? 9999;
        return ar - br;
      });
    }

    return data;
  }, [rows, search, sort]);

  async function remove(id: string) {
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (!error) setRows((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      {/* Top actions row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <button
          onClick={() => setOpenNew(true)}
          className="px-4 py-2 rounded-xl bg-[#4B2DB3] text-white text-sm w-fit"
        >
          + Add New Blog
        </button>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            className="w-full md:w-80 border rounded-xl px-3 py-2 text-sm"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-xl px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="featured">Featured rank</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <BlogCard
            key={b.id}
            blog={b}
            onEdit={() => setEditRow(b)}
            onDelete={() => remove(b.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="text-sm text-gray-500 p-6">No blogs found.</div>
        )}
      </div>

      {(openNew || editRow) && (
        <BlogUpsertDialog
          initial={editRow}
          onClose={() => {
            setOpenNew(false);
            setEditRow(null);
          }}
          onSaved={(saved : any) => {
            setRows((p) => {
              const exists = p.find((x) => x.id === saved.id);
              if (exists) return p.map((x) => (x.id === saved.id ? saved : x));
              return [saved, ...p];
            });
            setOpenNew(false);
            setEditRow(null);
          }}
        />
      )}
    </div>
  );
}
