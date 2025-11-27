"use client";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MonthlyBookingsChart({ data }: { data: any[] }) {
  const chartData = data.map(d => ({
    month: new Date(d.month).toLocaleString("en-US", { month: "short" }),
    bookings: d.bookings
  }));

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4 h-[320px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Monthly Bookings</h4>
        <select className="text-xs border rounded-lg px-2 py-1 bg-white">
          <option>Last 7 Months</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData}>
          <XAxis dataKey="month" />
          <Tooltip />
          <Bar dataKey="bookings" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
