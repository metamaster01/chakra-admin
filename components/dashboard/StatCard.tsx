export default function StatCard({
  title, value, sub
}: { title: string; value: string | number; sub: string }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <h3 className="text-3xl font-bold mt-2 text-gray-900">{value}</h3>
      <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
        {sub}
      </span>
    </div>
  );
}
