import { supabaseServer } from "@/lib/supabase-server";

export async function getCustomers() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("v_customer_stats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
