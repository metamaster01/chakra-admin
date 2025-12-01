import { supabaseServer } from "@/lib/supabase-server";

export async function getBlogsAdmin() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("blogs")
    .select(`
      id, title, slug, excerpt, thumb_path, hero_path,
      created_at, read_minutes, featured, featured_rank, published,
      author_id,
      blog_authors(name, avatar_path),
      blog_category_map(
        blog_categories(id, title, slug)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBlogMetaForSlug(slug: string) {
  const supabase =  await supabaseServer();
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
