import AdminShell from "@/components/layout/AdminShell";
import StatCard from "@/components/dashboard/StatCard";
import MonthlyBookingsChart from "@/components/dashboard/MonthlyBookingChart";
import TopServicesDonut from "@/components/dashboard/TopServicesDoutn";
import MostOrderedList from "@/components/dashboard/MostOrderedList";
import UpcomingAppointmentsTable from "@/components/dashboard/UpcomingAppointmentsTable";
import { getDashboardData } from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm shadow">
            <a href="/bookings">
            
            View Bookings
            </a>
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#4B2DB3] text-white text-sm shadow">
            <a href="/orders">
            
            View Orders
            </a>
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Booking" value={data.totalBookings} sub="Last 30 Days" />
        <StatCard title="Today's Appointments" value={data.todaysBookings} sub="Updated live" />
        <StatCard
          title="Total Revenue"
          value={`₹${(data.totalRevenuePaise / 100).toLocaleString("en-IN")}`}
          sub="Updated live"
        />
        <StatCard title="New Customers" value={data.newCustomers} sub="+ this week" />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <TopServicesDonut data={data.topServices} />
        <MonthlyBookingsChart data={data.monthlyBookings} />
        <MostOrderedList data={data.mostOrdered} />
      </div>

      {/* Upcoming */}
      <div className="mt-6">
        <UpcomingAppointmentsTable data={data.upcoming} />
      </div>
    </AdminShell>
  );
}
