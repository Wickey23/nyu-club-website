import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

const allowedRoles = new Set(["super_admin", "admin", "events_manager", "media_manager", "team_manager"]);

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email,display_name,role,status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status === "disabled" || !allowedRoles.has(profile.role)) {
    redirect("/admin/login?error=not-authorized");
  }

  return <AdminDashboard adminEmail={profile.email || user.email || ""} adminRole={profile.role} />;
}
