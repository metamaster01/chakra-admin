"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const redirectTo = `${location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-purple-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
      <p className="text-gray-500 mt-1 text-sm">
        Enter your email and we’ll send a reset link.
      </p>

      {!sent ? (
        <form onSubmit={handleSend} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full text-sm text-gray-600 hover:underline"
          >
            Back to login
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-xl bg-green-50 text-green-800 p-4 text-sm">
          Reset link sent. Please check your email.
        </div>
      )}
    </div>
  );
}
