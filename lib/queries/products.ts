import { supabaseServer } from "@/lib/supabase-server";

export type ProductImageRow = {
  id: number;
  product_id: number | null;
  url: string;
  alt: string | null;
  sort_order: number | null;
};

export type ProductVariantRow = {
  id: number;
  product_id: number;
  sku: string | null;
  color_label: string | null;
  color_value: string | null;
  size_label: string | null;
  price_paise: number;
  mrp_paise: number | null;
  stock: number | null;
  image_url: string | null;
  created_at: string;
};

export type ProductRow = {
  id: number;
  slug: string;
  name: string;
  short_desc: string | null;
  long_desc: string | null;
  description: string | null;

  price_paise: number;
  mrp_paise: number | null;
  compare_at_paise: number | null;

  sku: string | null;
  track_inventory: boolean | null;
  stock: number | null;
  reserved: number | null;

  rating_avg: string | number | null;
  rating_count: number | null;

  is_active: boolean | null;

  primary_image_url: string | null;
  meta: any | null;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  product_images: ProductImageRow[];
  product_variants: ProductVariantRow[];

  sold: number; // computed
};

export type ProductsAdminPayload = {
  products: ProductRow[];
};

export async function getProductsAdmin(): Promise<ProductsAdminPayload> {
  const supabase = await supabaseServer();

  // 1) products + relations
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select(
      `
      id,
      slug,
      name,
      short_desc,
      long_desc,
      description,
      price_paise,
      mrp_paise,
      compare_at_paise,
      sku,
      track_inventory,
      stock,
      reserved,
      rating_avg,
      rating_count,
      is_active,
      primary_image_url,
      meta,
      created_at,
      updated_at,
      deleted_at,
      product_images(id, product_id, url, alt, sort_order),
      product_variants(id, product_id, sku, color_label, color_value, size_label, price_paise, mrp_paise, stock, image_url, created_at)
    `
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(400);

  if (pErr) throw pErr;

  const productList = (products ?? []).map((p: any) => ({
    ...p,
    product_images: (p.product_images ?? []).sort(
      (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ),
    product_variants: (p.product_variants ?? []).sort(
      (a: any, b: any) => a.id - b.id
    ),
    sold: 0,
  })) as ProductRow[];

  // 2) sold count from paid orders (sum order_items.quantity per product)
  // NOTE: uses join `orders!inner(...)` and filters orders.payment_status='paid'
  const { data: oi, error: oiErr } = await supabase
    .from("order_items")
    .select(`product_id, quantity, orders!inner(payment_status)`)
    .eq("orders.payment_status", "paid")
    .limit(5000);

  if (oiErr) throw oiErr;

  const soldMap = new Map<number, number>();
  for (const row of oi ?? []) {
    const pid = row.product_id;
    if (!pid) continue;
    soldMap.set(pid, (soldMap.get(pid) ?? 0) + (row.quantity ?? 0));
  }

  for (const p of productList) {
    p.sold = soldMap.get(p.id) ?? 0;
  }

  return { products: productList };
}
