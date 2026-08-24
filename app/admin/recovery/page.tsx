import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import RecoveryCenter from "./RecoveryCenter";
import "./recovery.css";

export default async function RecoveryPage(){
 const supabase=await createSupabaseServerClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/admin/login");const{data:profile}=await supabase.from("profiles").select("role,status").eq("id",user.id).single();if(!profile||profile.status!=="active"||!["super_admin","admin"].includes(profile.role))redirect("/admin");return <RecoveryCenter/>;
}
