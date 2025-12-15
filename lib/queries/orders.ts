import { supabaseServer } from "@/lib/supabase-server";

export type OrderItemRow = {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  name_snapshot: string;
  unit_price_paise: number;
  quantity: number;
  color_snapshot: string | null;
  size_snapshot: string | null;
  image_snapshot: string | null;
  line_total_paise: number | null;
  created_at: string;
};

// export type OrderRow = {
//   id: number;
//   user_id: string | null;
//   email: string | null;
//   phone: string | null;

//   contact_email: string | null;
//   contact_phone: string | null;

//   payment_status: string | null; // e.g. paid/unpaid/draft
//   payment_method: string | null; // e.g. razorpay/cod/upi
//   shipping_method: string | null;

//   // you said you'll add this column:
//   shipping_status?: string | null; // in_process/completed/cancelled

//   razorpay_order_id: string | null;
//   razorpay_payment_id: string | null;

//   currency: string;
//   total_paise: number;

//   status: string; // order_status enum (created/...)
//   notes: string | null;

//   address: any | null;
//   shipping_address: any | null;

//   created_at: string;
//   updated_at: string;

//   profiles: {
//     full_name: string | null;
//     avatar_url: string | null;
//     phone: string | null;
//   } | null;

//   order_items: OrderItemRow[];
// };


export type OrderRow = {
  id: number;
  user_id: string | null;

  // these can be null
  email: string | null;
  phone: string | null;
  shipping_address: any | null;

  // these are actually filled
  contact_email: string | null;
  contact_phone: string | null;

  // IMPORTANT: this is what your row shows ("paid")
  status: string; // paid | draft | ...

  payment_status: string | null; // also "paid" in your row
  payment_method: string | null; // cod/upi/card etc.

  shipping_method: string | null;
  shipping_status?: string | null;

  // address comes as JSON string in your row
  address: any | string | null;

  currency: string;
  total_paise: number;

  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;

  notes: string | null;
  created_at: string;
  updated_at: string;

  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;

  order_items: OrderItemRow[];
};


export async function getOrders(): Promise<OrderRow[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      email,
      phone,
      contact_email,
      contact_phone,
      payment_status,
      payment_method,
      shipping_method,
      shipping_status,
      razorpay_order_id,
      razorpay_payment_id,
      total_paise,
      currency,
      status,
      notes,
      address,
      shipping_address,
      created_at,
      updated_at,
      profiles(full_name, avatar_url, phone),
      order_items(
        id,
        product_id,
        variant_id,
        name_snapshot,
        unit_price_paise,
        quantity,
        color_snapshot,
        size_snapshot,
        image_snapshot,
        line_total_paise,
        created_at
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
}
