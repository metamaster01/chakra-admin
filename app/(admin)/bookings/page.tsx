import AdminShell from "@/components/layout/AdminShell";
import BookingsTable from "@/components/bookings/BookingsTable";
import { getBookings } from "@/lib/queries/bookings";

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">From service_bookings.</p>
        </div>
        {/* You said no “Add booking” button */}
      </div>

      <BookingsTable initialData={bookings} />
    </AdminShell>
  );
}
