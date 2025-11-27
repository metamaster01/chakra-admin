import { supabaseServer } from "@/lib/supabase-server";

export async function getServices() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      service_benefits(id, label, sort_order)
      
    `)
    .order("id", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
