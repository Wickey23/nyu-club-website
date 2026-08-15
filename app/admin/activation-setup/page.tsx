import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import ActivationSetupEditor from "./ActivationSetupEditor";

export default async function ActivationSetupPage(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const {data:profile}=await supabase.from("profiles").select("role,status").eq("id",user.id).single();
  if(!profile||profile.status!=="active"||profile.role!=="super_admin")redirect("/admin");
  return <ActivationSetupEditor/>;
}
