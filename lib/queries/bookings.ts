import { supabaseServer } from "@/lib/supabase-server";

export async function getBookings() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("service_bookings")
    .select(`
      id,
      user_id,
      contact_name,
      contact_email,
      contact_phone,
      address,
      preferred_date,
      preferred_time,
      timezone,
      preferred_location,
      notes,
      status,
      payment_status,
      created_at,
      services(title),
      booking_cancellation_requests(reason, created_at)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Sort cancellation requests so [0] is latest (if any)
  const mapped = (data ?? []).map((b: any) => {
    const reqs = Array.isArray(b.booking_cancellation_requests) ? b.booking_cancellation_requests : [];
    reqs.sort((a: any, c: any) => new Date(c.created_at).getTime() - new Date(a.created_at).getTime());
    return { ...b, booking_cancellation_requests: reqs };
  });

  return mapped;
}
