"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import UserRoleRow from "./userRoleRow";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "employee";
};

export default function RoleManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const supabase = supabaseBrowser();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  }, [search, users]);

  async function callEdge(url: string, body: any) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed");
  }

  async function grant(userId: string, role: "admin" | "employee") {
    try {
      setErr(null); setBusyId(userId);

      await callEdge(
        "https://qpghcimdivxmyxpqxnxv.supabase.co/functions/v1/grant-role",
        { targetUserId: userId, role }
      );

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function revoke(userId: string) {
    try {
      setErr(null); setBusyId(userId);

      await callEdge(
        "https://qpghcimdivxmyxpqxnxv.supabase.co/functions/v1/revoke-role",
        { targetUserId: userId }
      );

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "employee" } : u));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-5">
      <h3 className="font-semibold text-gray-900">Admin Access</h3>
      <p className="text-xs text-gray-500 mt-1">
        Grant or revoke admin panel access. Users must already exist.
      </p>

      <input
        placeholder="Search by name or email..."
        className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {err && (
        <div className="mt-3 text-xs bg-red-50 text-red-700 p-2 rounded-lg">
          {err}
        </div>
      )}

      <div className="mt-3 space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filtered.map(u => (
          <UserRoleRow
            key={u.id}
            user={u}
            busy={busyId === u.id}
            onGrantAdmin={() => grant(u.id, "admin")}
            onRevoke={() => revoke(u.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">No users found.</p>
        )}
      </div>
    </div>
  );
}
