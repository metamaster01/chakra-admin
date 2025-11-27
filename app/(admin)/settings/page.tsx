import AdminShell from "@/components/layout/AdminShell";
import ProfileForm from "@/components/settings/ProfileForm";
import RoleManager from "@/components/settings/RoleManager";
import { getSettingsData } from "@/lib/queries/settings";

export default async function SettingsPage() {
  const { profile, myRole, users } = await getSettingsData();

  return (
    <AdminShell>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and admin access.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="xl:col-span-2">
          <ProfileForm initialProfile={profile} />
        </div>

        {/* Super admin only */}
        {myRole === "super_admin" && (
          <div className="xl:col-span-1">
            <RoleManager initialUsers={users} />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
