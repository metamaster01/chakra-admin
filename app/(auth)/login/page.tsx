"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setErr(error?.message ?? "Login failed");
      setLoading(false);
      return;
    }

    // ✅ Admin check: user must exist in blog_admins OR service_admins
    // (super admin you create manually in Supabase will be inserted there later)
    // const uid = data.user.id;

    // const [blogAdmins, serviceAdmins] = await Promise.all([
    //   supabase.from("blog_admins").select("uid").eq("uid", uid).maybeSingle(),
    //   supabase
    //     .from("service_admins")
    //     .select("user_id")
    //     .eq("user_id", uid)
    //     .maybeSingle(),
    // ]);

    // const isAdmin =
    //   (!!blogAdmins.data && !blogAdmins.error) ||
    //   (!!serviceAdmins.data && !serviceAdmins.error);

    // if (!isAdmin) {
    //   await supabase.auth.signOut();
    //   setErr("You don’t have access to the admin panel.");
    //   setLoading(false);
    //   return;
    // }

    const uid = data.user.id;

    const { data: roleRow, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .maybeSingle();

    const role = roleRow?.role;

    const isAdmin = role === "admin" || role === "super_admin";

    if (!isAdmin) {
      await supabase.auth.signOut();
      setErr("You don’t have access to the admin panel.");
      setLoading(false);
      return;
    }

    router.replace("/"); // dashboard (we’ll build next)
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo top-left feel inside card */}
      <div className="mb-6 flex items-center gap-3">
        
        {/* <img src="/logo.png" alt="chakra-image" className="w-12 h-12" />
         */}
         {/* <img src="/logo.png" alt="chakra image" className="w-12 h-12"/>  */}
         
          <div className="h-12 w-12 rounded-xl bg-[#4B2DB3] text-white grid place-items-center font-bold">
          CH
        </div>
        <div>
          <p className="text-sm text-gray-500">Welcome to</p>
          <h1 className="text-xl font-semibold text-gray-900">
            Chakra Healing Admin
          </h1>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl border border-purple-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Use your admin credentials to continue
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-purple-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-6 text-center text-xs text-gray-500">
        Developed by MetaMaster • All rights reserved
      </footer>
    </div>
  );
}
