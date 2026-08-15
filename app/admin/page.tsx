import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";
import AdminDashboard from "./AdminDashboard";
import ViewerDashboard from "./ViewerDashboard";

const allowedRoles=new Set(["super_admin","admin","events_manager","media_manager","team_manager","viewer"]);
export default async function AdminPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("profiles").select("email,display_name,role,status").eq("id",user.id).single();
  if(!profile||profile.status!=="active"||!allowedRoles.has(profile.role))redirect("/admin/login?error=not-authorized");
  await supabase.rpc("touch_own_profile_seen");
  if(profile.role==="viewer")return <ViewerDashboard adminEmail={profile.email||user.email||""}/>;
  const canInstagram=["super_admin","admin","media_manager"].includes(profile.role);
  return <>{profile.role==="super_admin"&&<><a className="admin-public-pages-shortcut" href="/admin/public-pages">Public Pages ✦</a><a href="/admin/activation-setup" style={{position:"fixed",right:170,top:18,zIndex:80,background:"#171514",color:"#fff",padding:"10px 14px",borderRadius:999,fontSize:12,fontWeight:800}}>Activation Setup ✓</a></>}{canInstagram&&<a className="admin-instagram-shortcut" href="/admin/instagram">Instagram ↗</a>}<AdminDashboard adminEmail={profile.email||user.email||""} adminRole={profile.role}/></>;
}
