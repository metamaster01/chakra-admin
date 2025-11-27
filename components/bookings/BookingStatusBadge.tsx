export default function BookingStatusBadge({ type, value }:{type:"status"|"payment"; value:string}) {
  const map: any = {
    status: {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    },
    payment: {
      unpaid: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      refunded: "bg-gray-100 text-gray-700",
    }
  };
  const cls = map[type][value] ?? "bg-gray-100 text-gray-700";
  return <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>{value}</span>;
}
