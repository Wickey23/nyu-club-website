import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";
import AdminDashboard from "./AdminDashboard";

const allowedRoles=new Set(["super_admin","admin","events_manager","media_manager","team_manager"]);
export default async function AdminPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("profiles").select("email,display_name,role,status").eq("id",user.id).single();
  if(!profile||profile.status!=="active"||!allowedRoles.has(profile.role))redirect("/admin/login?error=not-authorized");
  await supabase.rpc("touch_own_profile_seen");
  const canInstagram=["super_admin","admin","media_manager"].includes(profile.role);
  return <>{canInstagram&&<a className="admin-instagram-shortcut" href="/admin/instagram">Instagram ↗</a>}<AdminDashboard adminEmail={profile.email||user.email||""} adminRole={profile.role}/></>;
}
