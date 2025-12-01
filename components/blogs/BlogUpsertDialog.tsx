"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import BlogImagesEditor from "./BlogImageEditor";
import BlogCategoriesPicker from "./BlogCategoriesPicker";

const publicUrlFromPath = (path?: string | null) =>
  path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-image/${path}`
    : "";

export default function BlogUpsertDialog({
  initial,
  onClose,
  onSaved,
}: {
  initial?: any | null;
  onClose: () => void;
  onSaved: (b: any) => void;
}) {
  const supabase = supabaseBrowser();
  const isEdit = !!initial;

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    read_minutes: initial?.read_minutes ?? 3,
    featured: initial?.featured ?? false,
    featured_rank: initial?.featured_rank ?? null,
    published: initial?.published ?? false,
    author_id: initial?.author_id ?? null,
    body1: initial?.body1 ?? "",
    body2: initial?.body2 ?? "",
    body3: initial?.body3 ?? "",
    body4: initial?.body4 ?? "",
    hero_path: initial?.hero_path ?? null,
    thumb_path: initial?.thumb_path ?? null,
  });

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initial?.blog_category_map?.map((m: any) => m.blog_categories?.id).filter(Boolean) ?? []
  );

  const [imagesByPos, setImagesByPos] = useState<
    { position: number; path: string | null; caption: string | null; file?: File | null }[]
  >(
    [1,2,3,4].map((pos)=> {
      const found = initial?.blog_images?.find((i:any)=>i.position===pos);
      return {
        position: pos,
        path: found?.path ?? null,
        caption: found?.caption ?? null,
        file: null
      };
    })
  );

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("blog_authors").select("id,name").order("name").then(({data})=>{
      setAuthors(data ?? []);
    });
    supabase.from("blog_categories").select("id,title,slug").order("title").then(({data})=>{
      setCategories(data ?? []);
    });
  }, []);

  function update<K extends keyof typeof form>(k: K, v: any) {
    setForm(p => ({...p, [k]: v}));
  }

  async function uploadToBlogBucket(file: File, keyPrefix: string) {
    const path = `blogs/${keyPrefix}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("blog-image")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return path; // store relative path (matches user-side helper)
  }

  async function save() {
    setLoading(true);
    setErr(null);

    try {
      // 1) create/update blog row first (without new uploads yet)
      const payload = isEdit ? { id: initial.id, ...form } : { ...form };
      const { data: blog, error: bErr } = await supabase
        .from("blogs")
        .upsert(payload)
        .select("*")
        .maybeSingle();
      if (bErr) throw bErr;
      if (!blog) throw new Error("Blog not saved");

      const blogId = blog.id;

      // 2) upload hero + thumb if chosen
      let hero_path = blog.hero_path;
      let thumb_path = blog.thumb_path;

      if (heroFile) hero_path = await uploadToBlogBucket(heroFile, blogId);
      if (thumbFile) thumb_path = await uploadToBlogBucket(thumbFile, blogId);

      if (heroFile || thumbFile) {
        const { error: uErr } = await supabase
          .from("blogs")
          .update({ hero_path, thumb_path })
          .eq("id", blogId);
        if (uErr) throw uErr;
      }

      // 3) replace blog_images (positions 1..4)
      await supabase.from("blog_images").delete().eq("blog_id", blogId);

      const imgRows: any[] = [];
      for (const img of imagesByPos) {
        let path = img.path;

        if (img.file) {
          path = await uploadToBlogBucket(img.file, `${blogId}/pos-${img.position}`);
        }

        if (path) {
          imgRows.push({
            blog_id: blogId,
            path,
            caption: img.caption ?? null,
            position: img.position
          });
        }
      }

      if (imgRows.length) {
        const { error: iErr } = await supabase.from("blog_images").insert(imgRows);
        if (iErr) throw iErr;
      }

      // 4) replace category map
      await supabase.from("blog_category_map").delete().eq("blog_id", blogId);

      if (selectedCategoryIds.length) {
        const mapRows = selectedCategoryIds.map((cid)=>({
          blog_id: blogId,
          category_id: cid
        }));
        const { error: mErr } = await supabase.from("blog_category_map").insert(mapRows);
        if (mErr) throw mErr;
      }

      // 5) refetch full for UI
      const { data: full } = await supabase
        .from("blogs")
        .select(`
          *,
          blog_authors(name, avatar_path),
          blog_images(position, path, caption),
          blog_category_map(blog_categories(id,title,slug))
        `)
        .eq("id", blogId)
        .maybeSingle();

      onSaved(full);
    } catch (e: any) {
      setErr(e.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      {/* ✅ scrollable modal */}
      <div className="bg-white w-[95%] max-w-4xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-4">
            {isEdit ? "Edit Blog" : "Add New Blog"}
          </h3>

          {err && (
            <div className="mb-3 text-sm bg-red-50 text-red-700 p-2 rounded-lg">
              {err}
            </div>
          )}

          {/* Main fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="Title">
              <input
                className="w-full border rounded-xl px-3 py-2"
                value={form.title}
                onChange={(e)=>update("title", e.target.value)}
              />
            </Field>

            <Field label="Slug (unique)">
              <input
                className="w-full border rounded-xl px-3 py-2"
                value={form.slug}
                onChange={(e)=>update("slug", e.target.value)}
              />
            </Field>

            <Field label="Excerpt" wide>
              <textarea
                className="w-full border rounded-xl px-3 py-2 h-16"
                value={form.excerpt}
                onChange={(e)=>update("excerpt", e.target.value)}
              />
            </Field>

            <Field label="Author">
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={form.author_id ?? ""}
                onChange={(e)=>update("author_id", e.target.value || null)}
              >
                <option value="">— None —</option>
                {authors.map(a=>(
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Read Minutes">
              <input
                type="number"
                className="w-full border rounded-xl px-3 py-2"
                value={form.read_minutes ?? 3}
                onChange={(e)=>update("read_minutes", Number(e.target.value))}
              />
            </Field>

            <div className="md:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e)=>update("published", e.target.checked)}
                />
                Published
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e)=>update("featured", e.target.checked)}
                />
                Featured
              </label>

              {form.featured && (
                <input
                  type="number"
                  className="border rounded-xl px-3 py-2 text-sm w-28"
                  placeholder="Rank"
                  value={form.featured_rank ?? ""}
                  onChange={(e)=>update("featured_rank", e.target.value ? Number(e.target.value) : null)}
                />
              )}
            </div>

            {/* Hero + Thumb uploads */}
            <Field label="Hero Image">
              <input type="file" accept="image/*" onChange={(e)=>setHeroFile(e.target.files?.[0] ?? null)} />
              {form.hero_path && (
                <img className="mt-2 h-24 rounded-lg object-cover"
                  src={publicUrlFromPath(form.hero_path)} />
              )}
            </Field>

            <Field label="Thumbnail Image">
              <input type="file" accept="image/*" onChange={(e)=>setThumbFile(e.target.files?.[0] ?? null)} />
              {form.thumb_path && (
                <img className="mt-2 h-24 rounded-lg object-cover"
                  src={publicUrlFromPath(form.thumb_path)} />
              )}
            </Field>
          </div>

          {/* Categories */}
          <div className="mt-5">
            <BlogCategoriesPicker
              categories={categories}
              selectedIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
            />
          </div>

          {/* Body fields */}
          <div className="mt-5 grid gap-3">
            <Field label="Body 1" wide>
              <textarea className="w-full border rounded-xl px-3 py-2 h-28"
                value={form.body1} onChange={(e)=>update("body1", e.target.value)} />
            </Field>
            <Field label="Body 2" wide>
              <textarea className="w-full border rounded-xl px-3 py-2 h-28"
                value={form.body2} onChange={(e)=>update("body2", e.target.value)} />
            </Field>
            <Field label="Body 3" wide>
              <textarea className="w-full border rounded-xl px-3 py-2 h-28"
                value={form.body3} onChange={(e)=>update("body3", e.target.value)} />
            </Field>
            <Field label="Body 4" wide>
              <textarea className="w-full border rounded-xl px-3 py-2 h-28"
                value={form.body4} onChange={(e)=>update("body4", e.target.value)} />
            </Field>
          </div>

          {/* Inline images positions */}
          <div className="mt-6">
            <BlogImagesEditor
              images={imagesByPos}
              onChange={setImagesByPos}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#4B2DB3] text-white"
            >
              {loading ? "Saving..." : "Save Blog"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, wide=false }:{label:string; children:any; wide?:boolean}) {
  return (
    <label className={`text-sm font-medium text-gray-700 ${wide?"md:col-span-2":""}`}>
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
