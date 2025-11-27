import { supabaseServer } from "@/lib/supabase-server";

export async function getDashboardData() {
  const supabase =  await supabaseServer();

  // 1) Total bookings (last 30 days)
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  const [{ count: totalBookings }, { count: todaysBookings }] = await Promise.all([
    supabase.from("service_bookings").select("*", { count: "exact", head: true })
      .gte("created_at", last30.toISOString()),
    supabase.from("service_bookings").select("*", { count: "exact", head: true })
      .gte("preferred_date", new Date().toISOString().slice(0, 10)) // today
  ]);

  // 2) Total revenue (this week) – use payments if you trust payment status
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount_paise, created_at")
    .gte("created_at", weekStart.toISOString());

  const totalRevenuePaise = payments?.reduce((s, p) => s + (p.amount_paise ?? 0), 0) ?? 0;

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
  const next7 = new Date(); next7.setDate(next7.getDate() + 7);
  const { data: upcoming } = await supabase
    .from("service_bookings")
    .select(`
      id, start_time, end_time, status,
      contact_name, services(title),
      staff(name)
    `)
    .gte("start_time", new Date().toISOString())
    .lte("start_time", next7.toISOString())
    .order("start_time");

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
