import { supabaseServer } from "@/lib/supabase-server";

export async function getContacts() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("contact")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
