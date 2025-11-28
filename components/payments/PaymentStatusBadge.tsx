export default function PaymentStatusBadge({ status }:{status:string}) {
  const cls =
    status === "paid" ? "bg-green-100 text-green-800" :
    status === "unpaid" ? "bg-yellow-100 text-yellow-800" :
    "bg-gray-100 text-gray-700";

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${cls}`}>
      {status}
    </span>
  );
}
