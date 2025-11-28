import { supabaseServer } from "@/lib/supabase-server";

export async function getPayments() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      email,
      phone,
      payment_status,
      payment_method,
      razorpay_payment_id,
      razorpay_order_id,
      total_paise,
      currency,
      status,
      created_at,
      notes,
      shipping_method,
      profiles(full_name, avatar_url)
    `)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
