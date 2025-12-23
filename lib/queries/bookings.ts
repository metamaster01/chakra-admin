// import { supabaseServer } from "@/lib/supabase-server";

// export async function getBookings() {
//   const supabase = await supabaseServer();

//   const { data, error } = await supabase
//     .from("service_bookings")
//     .select(
//       `
//       id,
//       user_id,
//       contact_name,
//       contact_email,
//       contact_phone,
//       address,
//       preferred_date,
//       preferred_slot,
//       timezone,
//       preferred_location,
//       notes,
//       status,
//       payment_status,
//       created_at,
//       services(title),
//       currency,
//       service_price_paise,
//       payment_method,
//       razorpay_payment_id,
//       razorpay_order_id,
//       paid_at,
//       booking_cancellation_requests(reason, created_at),
//       service_booking_payments(amount_paise, currency,provider, razorpay_order_id, razorpay_payment_id, status,updated_at, created_at),
//       service_booking_items(
//   id,
//   title_snapshot,
//   unit_price_paise,
//   quantity,
//   services(title)
// )


//     `
//     )
//     .order("created_at", { ascending: false });

//   if (error) throw error;

//   // Sort cancellation requests so [0] is latest (if any)
//   const mapped = (data ?? []).map((b: any) => {
//     const reqs = Array.isArray(b.booking_cancellation_requests)
//       ? b.booking_cancellation_requests
//       : [];
//     reqs.sort(
//       (a: any, c: any) =>
//         new Date(c.created_at).getTime() - new Date(a.created_at).getTime()
//     );

//     const pays = Array.isArray(b.service_booking_payments)
//       ? b.service_booking_payments
//       : [];
//     pays.sort(
//       (a: any, c: any) =>
//         new Date(c.created_at).getTime() - new Date(a.created_at).getTime()
//     );

//     return {
//       ...b,
//       booking_cancellation_requests: reqs,
//       service_booking_payments: pays,
//     };
//   });

//   return mapped;
// }





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
      preferred_slot,
      timezone,
      preferred_location,
      notes,
      status,
      payment_status,
      created_at,
      currency,
      service_price_paise,
      payment_method,
      razorpay_payment_id,
      razorpay_order_id,
      paid_at,

      service_booking_items(
        id,
        service_id,
        title_snapshot,
        unit_price_paise,
        quantity,
        created_at,
        services(title)
      ),

      booking_cancellation_requests(reason, created_at),

      service_booking_payments(
        amount_paise,
        currency,
        provider,
        razorpay_order_id,
        razorpay_payment_id,
        status,
        updated_at,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const mapped = (data ?? []).map((b: any) => {
    const reqs = Array.isArray(b.booking_cancellation_requests) ? b.booking_cancellation_requests : [];
    reqs.sort((a: any, c: any) => new Date(c.created_at).getTime() - new Date(a.created_at).getTime());

    const pays = Array.isArray(b.service_booking_payments) ? b.service_booking_payments : [];
    pays.sort((a: any, c: any) => new Date(c.created_at).getTime() - new Date(a.created_at).getTime());

    const items = Array.isArray(b.service_booking_items) ? b.service_booking_items : [];
    items.sort((a: any, c: any) => new Date(a.created_at).getTime() - new Date(c.created_at).getTime());

    return {
      ...b,
      booking_cancellation_requests: reqs,
      service_booking_payments: pays,
      service_booking_items: items,
    };
  });

  return mapped;
}
