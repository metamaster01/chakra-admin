export default function UserRoleRow({
  user, busy, onGrantAdmin, onRevoke
}: {
  user: any;
  busy: boolean;
  onGrantAdmin: () => void;
  onRevoke: () => void;
}) {
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.full_name || "No name"}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>

      <span className={`text-xs px-2 py-1 rounded-full
        ${user.role === "super_admin" ? "bg-purple-100 text-purple-800" :
          user.role === "admin" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-700"}`}>
        {user.role}
      </span>

      {user.role !== "super_admin" && (
        isAdmin ? (
          <button
            disabled={busy}
            onClick={onRevoke}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {busy ? "..." : "Revoke"}
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={onGrantAdmin}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#4B2DB3] text-white hover:bg-[#3b2390] disabled:opacity-50"
          >
            {busy ? "..." : "Grant Admin"}
          </button>
        )
      )}
    </div>
  );
}
