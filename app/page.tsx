import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function RootPage() {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // not logged in → send to login
  if (!session) {
    redirect("/login");
  }

  // logged in → send to admin dashboard
  redirect("/dashboard");
}
