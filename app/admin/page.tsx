import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

const allowedRoles = new Set(["super_admin", "admin", "events_manager", "media_manager", "team_manager"]);

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
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

  const canNewsletter = profile.role === "super_admin" || profile.role === "admin";
  return <>
    <AdminDashboard adminEmail={profile.email || user.email || ""} />
    <nav aria-label="Admin tools" style={{position:"fixed",right:18,bottom:18,zIndex:50,display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
      {canNewsletter && <a href="/admin/newsletter" style={{background:"#111",color:"#fff",padding:"10px 14px",borderRadius:999,textDecoration:"none",fontWeight:800,fontSize:13,boxShadow:"0 8px 25px rgba(0,0,0,.2)"}}>Newsletter</a>}
      {profile.role === "super_admin" && <a href="/admin/users" style={{background:"#c91525",color:"#fff",padding:"10px 14px",borderRadius:999,textDecoration:"none",fontWeight:800,fontSize:13,boxShadow:"0 8px 25px rgba(0,0,0,.2)"}}>Users & Access</a>}
    </nav>
  </>;
}
