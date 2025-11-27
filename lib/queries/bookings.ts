import { supabaseServer } from "@/lib/supabase-server";

export async function getBookings() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("service_bookings")
    .select(`
      id, contact_name, contact_email, preferred_date, preferred_time,
      preferred_location, status, payment_status, created_at,
      services(title)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
