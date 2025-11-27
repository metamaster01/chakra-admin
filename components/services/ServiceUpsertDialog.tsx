"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import ServiceBenefitsEditor from "./ServiceBenefitsEditor";

export default function ServiceUpsertDialog({
  initial,
  onClose,
  onSaved,
}: {
  initial?: any | null;
  onClose: () => void;
  onSaved: (s: any) => void;
}) {
  const supabase = supabaseBrowser();
  const isEdit = !!initial;

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    short_desc: initial?.short_desc ?? "",
    long_desc: initial?.long_desc ?? "",
    is_active: initial?.is_active ?? true,
    image_path: initial?.image_path ?? null, // stored in services table
  });

  const [benefits, setBenefits] = useState<string[]>(
    initial?.service_benefits
      ?.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      ?.map((b: any) => b.label) ?? [""]
  );

  // image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // build correct preview URL for existing image_path
  const existingImageUrl = useMemo(() => {
    const path = form.image_path;

    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path; // already full URL
    }

    // treat as storage relative path
    const { data } = supabase.storage
      .from("service-images")
      .getPublicUrl(path);

    return data.publicUrl;
  }, [form.image_path, supabase]);

  useEffect(() => {
    // show newly selected file preview OR existing image
    if (imagePreview) return;
  }, [imagePreview]);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setLoading(true);
    setErr(null);

    try {
      // 1) upsert main service
      const payload = isEdit ? { id: initial.id, ...form } : { ...form };

      const { data: service, error: sErr } = await supabase
        .from("services")
        .upsert(payload)
        .select("*")
        .maybeSingle();

      if (sErr) throw sErr;
      if (!service) throw new Error("Service not saved");

      const serviceId = service.id;

      // 2) replace benefits
      await supabase
        .from("service_benefits")
        .delete()
        .eq("service_id", serviceId);

      const cleanBenefits = benefits.map((b) => b.trim()).filter(Boolean);

      if (cleanBenefits.length) {
        const inserts = cleanBenefits.map((label, i) => ({
          service_id: serviceId,
          label,
          sort_order: i,
        }));

        const { error: bErr } = await supabase
          .from("service_benefits")
          .insert(inserts);

        if (bErr) throw bErr;
      }

      // 3) upload ONE image (optional)
      let finalImagePath = form.image_path || service.image_path || null;

      if (imageFile) {
        const storagePath = `services/${serviceId}/${Date.now()}-${imageFile.name}`;

        const { error: upErr } = await supabase.storage
          .from("service-images")
          .upload(storagePath, imageFile, {
            upsert: false,
            contentType: imageFile.type,
          });

        if (upErr) throw upErr;

        // store relative path OR full URL — I recommend full URL for simplicity.
        const { data: pub } = supabase.storage
          .from("service-images")
          .getPublicUrl(storagePath);

        finalImagePath = pub.publicUrl;

        const { error: imgUpdateErr } = await supabase
          .from("services")
          .update({ image_path: finalImagePath })
          .eq("id", serviceId);

        if (imgUpdateErr) throw imgUpdateErr;
      }

      // 4) refetch full service for UI
      const { data: full, error: fErr } = await supabase
        .from("services")
        .select(`*, service_benefits(id, label, sort_order)`)
        .eq("id", serviceId)
        .maybeSingle();

      if (fErr) throw fErr;

      onSaved(full);
    } catch (e: any) {
      setErr(e.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      {/* ✅ scrollable modal */}
      <div className="bg-white w-[95%] max-w-3xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-4">
            {isEdit ? "Edit Service" : "Add New Service"}
          </h3>

          {err && (
            <div className="mb-3 text-sm bg-red-50 text-red-700 p-2 rounded-lg">
              {err}
            </div>
          )}

          {/* Main fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Input
              label="Service Title"
              value={form.title}
              onChange={(v) => updateField("title", v)}
            />

            <Input
              label="Slug (unique)"
              value={form.slug}
              onChange={(v) => updateField("slug", v)}
            />

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Description
                <textarea
                  className="mt-1 w-full border rounded-xl px-3 py-2 h-20"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Short Description
                <textarea
                  className="mt-1 w-full border rounded-xl px-3 py-2 h-16"
                  value={form.short_desc}
                  onChange={(e) => updateField("short_desc", e.target.value)}
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Long Description
                <textarea
                  className="mt-1 w-full border rounded-xl px-3 py-2 h-28"
                  value={form.long_desc}
                  onChange={(e) => updateField("long_desc", e.target.value)}
                />
              </label>
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateField("is_active", e.target.checked)}
              />
              <span className="text-sm">Active</span>
            </div>
          </div>

          {/* Benefits + Image */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <ServiceBenefitsEditor benefits={benefits} onChange={setBenefits} />

            {/* Single image uploader */}
            <div className="bg-gray-50 border rounded-2xl p-4">
              <h4 className="font-semibold mb-2">Service Image</h4>

              {(imagePreview || existingImageUrl) && (
                <img
                  src={imagePreview || existingImageUrl}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                  alt="service"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                  if (file) setImagePreview(URL.createObjectURL(file));
                }}
                className="text-sm"
              />

              <p className="text-xs text-gray-500 mt-2">
                Uploads to bucket <b>service-images</b> and saves URL in{" "}
                <b>services.image_path</b>.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#4B2DB3] text-white"
            >
              {loading ? "Saving..." : "Save Service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label}
      <input
        type={type}
        className="mt-1 w-full border rounded-xl px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
