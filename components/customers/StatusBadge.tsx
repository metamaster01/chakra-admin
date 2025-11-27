export default function StatusBadge({ status }: { status:"active"|"inactive"|"lost" }) {
  const cls =
    status === "active" ? "bg-green-100 text-green-800" :
    status === "inactive" ? "bg-yellow-100 text-yellow-800" :
    "bg-red-100 text-red-800";

  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{status}</span>;
}
