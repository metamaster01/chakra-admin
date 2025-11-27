import { supabaseServer } from "@/lib/supabase-server";

export async function getSettingsData() {
  const supabase = await supabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Not authenticated");

  // current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // current user's role
  const { data: myRoleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const myRole = myRoleRow?.role ?? "employee";

  // if super admin, load all profiles + roles for role manager
  let users: any[] = [];
  if (myRole === "super_admin") {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]));

    users = (profiles ?? []).map(p => ({
      ...p,
      role: roleMap.get(p.id) ?? "employee"
    }));
  }

  return { profile, myRole, users };
}
