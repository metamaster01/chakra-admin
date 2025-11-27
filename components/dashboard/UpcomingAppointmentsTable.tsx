export default function UpcomingAppointmentsTable({ data }: { data: any[] }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Upcoming Appointments</h4>
        <div className="flex gap-2">
          <input
            className="border rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Search"
          />
          <button className="border rounded-xl px-3 py-2 text-sm bg-white">
            Filters
          </button>
          <button className="rounded-xl px-3 py-2 text-sm bg-[#4B2DB3] text-white">
            + Add new appointment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Client Name</th>
              <th className="text-left py-2">Service</th>
              <th className="text-left py-2">Therapist</th>
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="py-3">
                  {new Date(b.start_time).toLocaleDateString()}
                </td>
                <td className="py-3">{b.contact_name || "—"}</td>
                <td className="py-3">{b.services?.title || "—"}</td>
                <td className="py-3">{b.staff?.name || "—"}</td>
                <td className="py-3">
                  {new Date(b.start_time).toLocaleTimeString()} -{" "}
                  {new Date(b.end_time).toLocaleTimeString()}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs
                    ${b.status === "completed" ? "bg-green-100 text-green-800" :
                      b.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-700"}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
