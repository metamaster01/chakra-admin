import { supabaseServer } from "@/lib/supabase-server";

export async function getDashboardData() {
  const supabase =  await supabaseServer();

  // 1) Total bookings (last 30 days)
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  const [{ count: totalBookings }] = await Promise.all([
    supabase.from("service_bookings").select("*", { count: "exact", head: true })
      .gte("created_at", last30.toISOString()),
    
  ]);

  // Today's appointments
  const todayStr2 = new Date().toISOString().slice(0, 10);

const { count: todaysBookings, error: tErr } = await supabase
  .from("service_bookings")
  .select("id", { count: "exact", head: true })
  .eq("preferred_date", todayStr2)
  .neq("status", "cancelled");

if (tErr) throw tErr;


  // 2) Total revenue (this week) – use payments if you trust payment status
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  // const { data: payments } = await supabase
  //   .from("payments")
  //   .select("amount_paise, created_at")
  //   .gte("created_at", weekStart.toISOString());

  // const totalRevenuePaise = payments?.reduce((s, p) => s + (p.amount_paise ?? 0), 0) ?? 0;

  // 2) Total revenue (ALL TIME) = Orders (paid) + Booking payments (paid)

// Orders revenue (includes COD, because COD marks payment_status='paid')
const { data: orderPaid, error: oErr } = await supabase
  .from("orders")
  .select("total_paise")
  .eq("payment_status", "paid");

if (oErr) throw oErr;

const ordersRevenuePaise =
  orderPaid?.reduce((sum, r) => sum + Number(r.total_paise ?? 0), 0) ?? 0;

// Booking revenue (only successful payment rows)
const { data: bookingPaid, error: bErr } = await supabase
  .from("service_booking_payments")
  .select("amount_paise")
  .eq("status", "paid");

if (bErr) throw bErr;

const bookingsRevenuePaise =
  bookingPaid?.reduce((sum, r) => sum + Number(r.amount_paise ?? 0), 0) ?? 0;

const totalRevenuePaise = ordersRevenuePaise + bookingsRevenuePaise;


  // 3) New customers (this week) from profiles
  const { count: newCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekStart.toISOString());

  // 4) Chart data from views (we’ll create below)
  const { data: monthlyBookings } = await supabase
    .from("v_monthly_bookings")
    .select("*")
    .order("month", { ascending: true });

  const { data: topServices } = await supabase
    .from("v_top_services_month")
    .select("*")
    .limit(5);

  const { data: mostOrdered } = await supabase
    .from("v_most_ordered_products_week")
    .select("*")
    .limit(3);

  // 5) Upcoming appointments (next 7 days)
  // const next7 = new Date(); next7.setDate(next7.getDate() + 7);
// 5) Upcoming appointments (today + next 7 days) based on preferred_date
const today = new Date();
const todayStr = today.toISOString().slice(0, 10);

const next7 = new Date();
next7.setDate(next7.getDate() + 7);
const next7Str = next7.toISOString().slice(0, 10);

const { data: upcoming, error: upErr } = await supabase
  .from("service_bookings")
  .select(`
    id,
    contact_name,
    contact_email,
    contact_phone,
    preferred_date,
    preferred_slot,
    preferred_location,
    status,
    payment_status,
    created_at,
    currency,
    service_price_paise,

    service_booking_items(
      id,
      title_snapshot,
      unit_price_paise,
      quantity,
      services(title)
    )
  `)
  .gte("preferred_date", todayStr)
  .lte("preferred_date", next7Str)
  .order("preferred_date", { ascending: true })
  .order("created_at", { ascending: false });

if (upErr) throw upErr;


  return {
    totalBookings: totalBookings ?? 0,
    todaysBookings: todaysBookings ?? 0,
    totalRevenuePaise,
    newCustomers: newCustomers ?? 0,
    monthlyBookings: monthlyBookings ?? [],
    topServices: topServices ?? [],
    mostOrdered: mostOrdered ?? [],
    upcoming: upcoming ?? []
  };
}
