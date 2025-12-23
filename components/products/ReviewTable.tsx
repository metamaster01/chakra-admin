"use client";

import React, { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { ReviewRow } from "@/lib/queries/reviews";

function pill(tone: "green" | "yellow" | "red" | "gray") {
  if (tone === "green") return "bg-green-50 text-green-700 ring-green-200";
  if (tone === "yellow") return "bg-yellow-50 text-yellow-700 ring-yellow-200";
  if (tone === "red") return "bg-red-50 text-red-700 ring-red-200";
  return "bg-gray-50 text-gray-700 ring-gray-200";
}

function StatusPill({ status }: { status: string | null | undefined }) {
  const s = String(status ?? "pending").toLowerCase();
  const tone =
    s === "approved" ? "green" :
    s === "pending" ? "yellow" :
    s === "rejected" ? "red" :
    "gray";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${pill(tone)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  const r = Math.max(1, Math.min(5, Number(rating || 0)));
  return (
    <div className="inline-flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < r ? "opacity-100" : "opacity-30"}>★</span>
      ))}
      <span className="ml-2 text-xs text-gray-500">{r}/5</span>
    </div>
  );
}

function short(s: any, n = 80) {
  const v = String(s ?? "").trim();
  if (!v) return "—";
  return v.length > n ? v.slice(0, n) + "…" : v;
}

export default function ReviewsTable({ initialData }: { initialData: ReviewRow[] }) {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState<ReviewRow[]>(initialData ?? []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const st = String(r.status ?? "pending").toLowerCase();
      if (status !== "all" && st !== status) return false;

      if (!query) return true;

      const hay = [
        `r${r.id}`,
        r.id,
        r.products?.name,
        r.products?.slug,
        r.profiles?.full_name,
        r.profiles?.phone,
        r.title,
        r.body,
        r.rating,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" ");

      return hay.includes(query);
    });
  }, [rows, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  React.useEffect(() => setPage(1), [q, status]);

  async function setReviewStatus(id: number, next: "approved" | "rejected" | "pending") {
    const { data, error } = await supabase
      .from("product_reviews")
      .update({ status: next })
      .eq("id", id)
      .select(`
        id, product_id, user_id, rating, title, body, status, created_at,
        products(id, name, primary_image_url, slug),
        profiles(full_name, phone)
      `)
      .single();

    if (error) {
      console.error(error);
      alert("Failed to update review status");
      return;
    }

    setRows((cur) => cur.map((x) => (x.id === id ? (data as any) : x)));
  }

  async function del(id: number) {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Failed to delete review");
      return;
    }
    setRows((cur) => cur.filter((x) => x.id !== id));
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
            <p className="text-sm text-gray-500 mt-1">Approve, reject, or review customer feedback.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reviews..."
              className="w-[320px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2E1A72]/20"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="text-xs text-gray-500">
              Showing <span className="font-medium">{filtered.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Review ID</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Title / Comment</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-800">
            {paged.map((r) => {
              const img = r.products?.primary_image_url ?? null;
              const productName = r.products?.name ?? "—";
              const userName = r.profiles?.full_name ?? "—";
              const userPhone = r.profiles?.phone ?? "";

              return (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-4 font-medium text-gray-900">R{String(r.id).padStart(4, "0")}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                        {img ? <img src={img} alt={productName} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-900">{productName}</div>
                        <div className="text-xs text-gray-500">{r.products?.slug ?? `Product #${r.product_id ?? "—"}`}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-gray-900">{userName}</div>
                      <div className="text-xs text-gray-500">
                        {userPhone ? `Phone: ${userPhone}` : r.user_id ? `user_id: ${r.user_id}` : "—"}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <Stars rating={r.rating} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">{short(r.title, 50)}</div>
                    <div className="text-xs text-gray-500">{short(r.body, 90)}</div>
                  </td>

                  <td className="px-5 py-4">
                    <StatusPill status={r.status} />
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "—"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReviewStatus(r.id, "approved")}
                        className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setReviewStatus(r.id, "rejected")}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => del(r.id)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                  No reviews found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="text-sm text-gray-600">
          Page <span className="font-medium">{page}</span> / {totalPages}
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
