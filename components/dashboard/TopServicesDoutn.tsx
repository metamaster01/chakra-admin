"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function TopServicesDonut({ data }: { data: any[] }) {
  const chartData = data.map((d) => ({
    name: d.service_title,
    value: d.bookings
  }));

  const colors = ["#4B2DB3", "#7C5CFF", "#B8A7FF", "#DDD6FF", "#EEE9FF"];

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4 h-[320px]">
      <h4 className="font-semibold text-gray-900 mb-2">Top 5 Wellness Services</h4>

      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie data={chartData} innerRadius={60} outerRadius={90} dataKey="value">
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <ul className="text-xs text-gray-700 grid grid-cols-2 gap-2 mt-2">
        {chartData.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
            {d.name} ({d.value})
          </li>
        ))}
      </ul>
    </div>
  );
}
