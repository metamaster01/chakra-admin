export default function ServiceStatusBadge({ active }:{active:boolean}) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${
      active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
    }`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
