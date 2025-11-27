import AdminShell from "@/components/layout/AdminShell";
import ContactTable from "@/components/contact/ContactTable";
import { getContacts } from "@/lib/queries/contact";

export default async function ContactPage() {
  const contacts = await getContacts();

  return (
    <AdminShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
        <p className="text-sm text-gray-500 mt-1">Messages from contact form.</p>
      </div>

      <ContactTable initialData={contacts} />
    </AdminShell>
  );
}
