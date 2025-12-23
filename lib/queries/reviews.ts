import { supabaseServer } from "@/lib/supabase-server";

export type ReviewRow = {
  id: number;
  product_id: number | null;
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected" | string | null;
  created_at: string | null;

  products: {
    id: number;
    name: string;
    primary_image_url: string | null;
    slug: string | null;
  } | null;

  profiles: {
    full_name: string | null;
    email: string | null; // if you have it in profiles (optional)
    phone: string | null;
  } | null;
};

export async function getReviewsAdmin(): Promise<ReviewRow[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("product_reviews")
    .select(`
      id,
      product_id,
      user_id,
      rating,
      title,
      body,
      status,
      created_at,
      products(id, name, primary_image_url, slug),
      profiles(full_name, phone)
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return (data ?? []) as unknown as ReviewRow[];
}
