import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import InstagramAdmin from "./InstagramAdmin";

export default async function InstagramAdminPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("profiles").select("role,status").eq("id",user.id).single();
  if(!profile||profile.status!=="active"||!["super_admin","admin","media_manager"].includes(profile.role))redirect("/admin");
  return <InstagramAdmin canEditSettings={profile.role==="super_admin"||profile.role==="admin"}/>;
}
