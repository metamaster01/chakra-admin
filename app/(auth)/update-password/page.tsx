"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    router.replace("/login");
  }

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-purple-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
      <p className="text-gray-500 mt-1 text-sm">
        Choose a strong password to secure your admin account.
      </p>

      <form onSubmit={handleUpdate} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">New password</label>
          <input
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Confirm password</label>
          <input
            type="password"
            required
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {err && (
          <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">
            {err}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-[#4B2DB3] hover:bg-[#3b2390] text-white py-2.5 font-semibold transition disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
