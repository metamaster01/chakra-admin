export default function MostOrderedList({ data }: { data: any[] }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4 h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Most ordered</h4>
        <select className="text-xs border rounded-lg px-2 py-1 bg-white">
          <option>Today</option>
          <option>This week</option>
        </select>
      </div>

      <div className="space-y-3 flex-1">
        {data.map((p) => (
          <div key={p.product_id} className="flex items-center gap-3">
            <img
              src={p.primary_image_url || "/placeholder.png"}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-gray-500">{p.qty} orders this week</p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-3 w-full rounded-xl bg-[#34206F] text-white py-2 text-sm">
        View All
      </button>
    </div>
  );
}
