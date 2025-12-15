"use client";

import React, { useMemo, useState } from "react";
import type { ProductRow, ProductVariantRow, ProductImageRow } from "@/lib/queries/products";
import { supabaseBrowser } from "@/lib/supabase-browser";

const BUCKET = "product-images"; // your sample URLs use product-images

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatMoneyInputToPaise(v: string) {
  // accepts "999" or "999.00"
  const num = Number(v);
  if (Number.isNaN(num) || num < 0) return 0;
  return Math.round(num * 100);
}

function paiseToMoneyInput(paise: number | null | undefined) {
  const n = (paise ?? 0) / 100;
  return String(n);
}

function genSkuBase(p: { sku?: string | null; slug?: string; name?: string }) {
  const base = (p.sku ?? "").trim();
  if (base) return base.toUpperCase();
  const raw = (p.slug || slugify(p.name || "PRODUCT")).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return raw.slice(0, 10) || "PRODUCT";
}

function genVariantSku(base: string, colorLabel?: string | null, sizeLabel?: string | null) {
  const c = (colorLabel ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const s = (sizeLabel ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const tail = String(Date.now()).slice(-5);
  return [base, c || "CLR", s || "SZ", tail].join("-");
}

async function uploadToStorage(file: File, productId: number) {
  const supabase = await (supabaseBrowser() as any);

  const ext = file.name.split(".").pop() || "png";
  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl as string;
}

type VariantDraft = Partial<ProductVariantRow> & {
  _tmpId: string;
};

export default function ProductUpsertDialog({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: ProductRow | null;
  onSaved: (saved: ProductRow) => void;
}) {
  const isEdit = !!initial?.id;

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [shortDesc, setShortDesc] = useState(initial?.short_desc ?? "");
  const [longDesc, setLongDesc] = useState(initial?.long_desc ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const [price, setPrice] = useState(paiseToMoneyInput(initial?.price_paise ?? 0));
  const [mrp, setMrp] = useState(paiseToMoneyInput(initial?.mrp_paise ?? 0));
  const [compareAt, setCompareAt] = useState(paiseToMoneyInput(initial?.compare_at_paise ?? 0));

  const [sku, setSku] = useState(initial?.sku ?? "");
  const [trackInv, setTrackInv] = useState(initial?.track_inventory ?? true);
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [active, setActive] = useState(initial?.is_active ?? true);

  const [metaColors, setMetaColors] = useState<string>(() => {
    const colors = initial?.meta?.colors;
    return Array.isArray(colors) ? colors.join(",") : "";
  });

  const existingImages = useMemo(() => (initial?.product_images ?? []).slice(0, 4), [initial]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [keepImageIds, setKeepImageIds] = useState<Set<number>>(new Set(existingImages.map((x) => x.id)));

  const [variants, setVariants] = useState<VariantDraft[]>(() => {
    const v = initial?.product_variants ?? [];
    return v.map((x) => ({ ...x, _tmpId: `v-${x.id}` }));
  });

  React.useEffect(() => {
    if (!open) return;
    // reset when dialog opens
    setErr(null);
    setSaving(false);

    setName(initial?.name ?? "");
    setSlug(initial?.slug ?? "");
    setShortDesc(initial?.short_desc ?? "");
    setLongDesc(initial?.long_desc ?? "");
    setDescription(initial?.description ?? "");

    setPrice(paiseToMoneyInput(initial?.price_paise ?? 0));
    setMrp(paiseToMoneyInput(initial?.mrp_paise ?? 0));
    setCompareAt(paiseToMoneyInput(initial?.compare_at_paise ?? 0));

    setSku(initial?.sku ?? "");
    setTrackInv(initial?.track_inventory ?? true);
    setStock(String(initial?.stock ?? 0));
    setActive(initial?.is_active ?? true);

    const colors = initial?.meta?.colors;
    setMetaColors(Array.isArray(colors) ? colors.join(",") : "");

    const imgs = (initial?.product_images ?? []).slice(0, 4);
    setKeepImageIds(new Set(imgs.map((x) => x.id)));
    setNewFiles([]);

    const v = initial?.product_variants ?? [];
    setVariants(v.map((x) => ({ ...x, _tmpId: `v-${x.id}` })));
  }, [open, initial]);

  if (!open) return null;

  function addVariant() {
    setVariants((cur) => [
      ...cur,
      {
        _tmpId: crypto.randomUUID(),
        color_label: "",
        color_value: "",
        size_label: "",
        price_paise: formatMoneyInputToPaise(price),
        mrp_paise: formatMoneyInputToPaise(mrp),
        stock: 0,
        sku: "",
      },
    ]);
  }

  function removeVariant(tmpId: string) {
    setVariants((cur) => cur.filter((v) => v._tmpId !== tmpId));
  }

  async function save() {
    setErr(null);

    const finalSlug = slug.trim() ? slugify(slug) : slugify(name);
    if (!name.trim()) return setErr("Product name is required.");
    if (!finalSlug) return setErr("Slug is required.");

    const pricePaise = formatMoneyInputToPaise(price);
    const mrpPaise = formatMoneyInputToPaise(mrp);
    const comparePaise = formatMoneyInputToPaise(compareAt);

    const stockInt = Math.max(0, Number(stock) || 0);
    const meta = {
      colors: metaColors
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    };

    setSaving(true);

    try {
      const supabase = await (supabaseBrowser() as any);

      // 1) Upsert product
      // let productId = initial?.id ?? null;

      let productId: number | null = initial?.id ?? null;


      if (!productId) {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name: name.trim(),
            slug: finalSlug,
            short_desc: shortDesc?.trim() || null,
            long_desc: longDesc?.trim() || null,
            description: description?.trim() || null,
            price_paise: pricePaise,
            mrp_paise: mrpPaise || null,
            compare_at_paise: comparePaise || null,
            sku: sku?.trim() || null,
            track_inventory: !!trackInv,
            stock: stockInt,
            is_active: !!active,
            meta,
            updated_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (error) throw error;
        productId = data.id;
      } else {
        const { error } = await supabase
          .from("products")
          .update({
            name: name.trim(),
            slug: finalSlug,
            short_desc: shortDesc?.trim() || null,
            long_desc: longDesc?.trim() || null,
            description: description?.trim() || null,
            price_paise: pricePaise,
            mrp_paise: mrpPaise || null,
            compare_at_paise: comparePaise || null,
            sku: sku?.trim() || null,
            track_inventory: !!trackInv,
            stock: stockInt,
            is_active: !!active,
            meta,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);
        if (error) throw error;
      }

      // 2) Images (max 4) => keep existing selected + new files
      const keptExisting = (initial?.product_images ?? [])
        .filter((img) => keepImageIds.has(img.id))
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      const room = Math.max(0, 4 - keptExisting.length);
      const filesToUpload = newFiles.slice(0, room);

      if (!productId) {
  throw new Error("Product ID is missing after save. Please try again.");
}

      const uploadedUrls: string[] = [];
      for (const f of filesToUpload) {
        const url = await uploadToStorage(f, productId);
        uploadedUrls.push(url);
      }

      // Rewrite product_images rows to enforce sort_order 0..N and remove unkept ones
      // (simple + stable)
      if (isEdit) {
        const existingIds = (initial?.product_images ?? []).map((x) => x.id);
        const toDelete = existingIds.filter((id) => !keepImageIds.has(id));
        if (toDelete.length) {
          const { error } = await supabase.from("product_images").delete().in("id", toDelete);
          if (error) throw error;
        }
      }

      // Update sort_order for kept ones
      for (let i = 0; i < keptExisting.length; i++) {
        const img = keptExisting[i];
        const { error } = await supabase
          .from("product_images")
          .update({ sort_order: i })
          .eq("id", img.id);
        if (error) throw error;
      }

      // Insert newly uploaded images with sort_order continuing
      for (let i = 0; i < uploadedUrls.length; i++) {
        const url = uploadedUrls[i];
        const { error } = await supabase.from("product_images").insert({
          product_id: productId,
          url,
          sort_order: keptExisting.length + i,
          alt: name.trim(),
        });
        if (error) throw error;
      }

      // Ensure primary_image_url points to sort_order 0
      const primary =
        keptExisting[0]?.url ??
        uploadedUrls[0] ??
        initial?.primary_image_url ??
        null;

      const { error: primErr } = await supabase
        .from("products")
        .update({ primary_image_url: primary, updated_at: new Date().toISOString() })
        .eq("id", productId);

      if (primErr) throw primErr;

      // 3) Variants: delete removed, upsert rest
      const existingVariantIds = new Set((initial?.product_variants ?? []).map((v) => v.id));
      const currentVariantIds = new Set(variants.filter((v) => v.id).map((v) => v.id as number));
      const removed = [...existingVariantIds].filter((id) => !currentVariantIds.has(id));

      if (isEdit && removed.length) {
        const { error } = await supabase.from("product_variants").delete().in("id", removed);
        if (error) throw error;
      }

      const baseSku = genSkuBase({ sku, slug: finalSlug, name });

      for (const v of variants) {
        const payload = {
          product_id: productId,
          sku: (v.sku ?? "").trim() || genVariantSku(baseSku, v.color_label, v.size_label),
          color_label: v.color_label?.trim() || null,
          color_value: v.color_value?.trim() || null,
          size_label: v.size_label?.trim() || null,
          price_paise: Number(v.price_paise ?? pricePaise),
          mrp_paise: v.mrp_paise ? Number(v.mrp_paise) : null,
          stock: Number(v.stock ?? 0),
          image_url: v.image_url ?? null,
        };

        if (v.id) {
          const { error } = await supabase.from("product_variants").update(payload).eq("id", v.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("product_variants").insert(payload);
          if (error) throw error;
        }
      }

      // 4) Re-fetch the saved product (so table updates are accurate)
      const { data: saved, error: sErr } = await supabase
        .from("products")
        .select(
          `
          id, slug, name, short_desc, long_desc, description,
          price_paise, mrp_paise, compare_at_paise, sku,
          track_inventory, stock, reserved, rating_avg, rating_count,
          is_active, primary_image_url, meta, created_at, updated_at, deleted_at,
          product_images(id, product_id, url, alt, sort_order),
          product_variants(id, product_id, sku, color_label, color_value, size_label, price_paise, mrp_paise, stock, image_url, created_at)
        `
        )
        .eq("id", productId)
        .single();

      if (sErr) throw sErr;

      const finalSaved: ProductRow = {
        ...(saved as any),
        product_images: (saved as any).product_images?.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) ?? [],
        product_variants: (saved as any).product_variants?.sort((a: any, b: any) => a.id - b.id) ?? [],
        sold: initial?.sold ?? 0, // keep current computed value in UI; server refresh will fix on reload
      };

      onSaved(finalSaved);
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 w-[min(980px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h3>
            <p className="mt-1 text-sm text-gray-500">Add details, images and variants.</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-6 py-5">
          {err ? <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!isEdit && !slug.trim()) setSlug(slugify(e.target.value));
                }}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Short Description</label>
              <input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Long Description</label>
              <textarea
                value={longDesc}
                onChange={(e) => setLongDesc(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">HTML Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20 font-mono"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Price (₹)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">MRP (₹)</label>
              <input
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Compare At (₹)</label>
              <input
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">SKU (base)</label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={trackInv} onChange={(e) => setTrackInv(e.target.checked)} />
                Track Inventory
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                Active
              </label>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Stock</label>
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={!trackInv}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20 disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Meta Colors (comma-separated hex)
              </label>
              <input
                value={metaColors}
                onChange={(e) => setMetaColors(e.target.value)}
                placeholder="#EADFCF,#A7C66B,#B8C7FF"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
              />
            </div>
          </div>

          {/* Images */}
          <div className="mt-6 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Images (max 4)</h4>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewFiles(Array.from(e.target.files ?? []).slice(0, 4))}
                className="text-sm"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {existingImages.map((img) => {
                const checked = keepImageIds.has(img.id);
                return (
                  <div key={img.id} className="rounded-xl border border-gray-200 p-2">
                    <img src={img.url} alt={img.alt ?? name} className="h-24 w-full rounded-lg object-cover" />
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setKeepImageIds((cur) => {
                            const next = new Set(cur);
                            if (e.target.checked) next.add(img.id);
                            else next.delete(img.id);
                            return next;
                          });
                        }}
                      />
                      Keep
                    </label>
                    <div className="mt-1 text-[11px] text-gray-500">order: {img.sort_order ?? 0}</div>
                  </div>
                );
              })}

              {newFiles.map((f) => (
                <div key={f.name} className="rounded-xl border border-gray-200 p-2">
                  <div className="h-24 w-full rounded-lg bg-gray-100 grid place-items-center text-xs text-gray-500">
                    {f.name}
                  </div>
                  <div className="mt-2 text-[11px] text-gray-500">new upload</div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Tip: Keep image #1 as your primary (sort_order 0).
            </div>
          </div>

          {/* Variants */}
          <div className="mt-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-900">Variants</h4>
              <button
                onClick={addVariant}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Add Variant
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr className="border-b border-gray-50">
                    <th className="px-4 py-3 font-medium">Color Label</th>
                    <th className="px-4 py-3 font-medium">Color Value</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium">Price (paise)</th>
                    <th className="px-4 py-3 font-medium">MRP (paise)</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {variants.map((v, idx) => (
                    <tr key={v._tmpId} className="border-b border-gray-50">
                      <td className="px-4 py-3">
                        <input
                          value={v.color_label ?? ""}
                          onChange={(e) =>
                            setVariants((cur) =>
                              cur.map((x) => (x._tmpId === v._tmpId ? { ...x, color_label: e.target.value } : x))
                            )
                          }
                          className="w-[160px] rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={v.color_value ?? ""}
                          onChange={(e) =>
                            setVariants((cur) =>
                              cur.map((x) => (x._tmpId === v._tmpId ? { ...x, color_value: e.target.value } : x))
                            )
                          }
                          placeholder="#FFFFFF"
                          className="w-[140px] rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={v.size_label ?? ""}
                          onChange={(e) =>
                            setVariants((cur) =>
                              cur.map((x) => (x._tmpId === v._tmpId ? { ...x, size_label: e.target.value } : x))
                            )
                          }
                          className="w-[120px] rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={String(v.price_paise ?? formatMoneyInputToPaise(price))}
                          onChange={(e) =>
                            setVariants((cur) =>
                              cur.map((x) => (x._tmpId === v._tmpId ? { ...x, price_paise: Number(e.target.value) } : x))
                            )
                          }
                          className="w-[140px] rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={String(v.mrp_paise ?? formatMoneyInputToPaise(mrp))}
                          onChange={(e) =>
                            setVariants((cur) =>
                              cur.map((x) => (x._tmpId === v._tmpId ? { ...x, mrp_paise: Number(e.target.value) } : x))
                            )
                          }
                          className="w-[140px] rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={String(v.stock ?? 0)}
                          onChange={(e) =>
                            setVariants((cur) =>
                              cur.map((x) => (x._tmpId === v._tmpId ? { ...x, stock: Number(e.target.value) } : x))
                            )
                          }
                          className="w-[90px] rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={v.sku ?? ""}
                          onChange={(e) =>
                            setVariants((cur) =>
                              cur.map((x) => (x._tmpId === v._tmpId ? { ...x, sku: e.target.value } : x))
                            )
                          }
                          placeholder="auto if empty"
                          className="w-[220px] rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeVariant(v._tmpId)}
                          className="rounded-lg border border-red-200 bg-white px-2 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}

                  {variants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                        No variants added.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-[#2E1A72] px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
