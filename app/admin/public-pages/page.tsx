import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import PublicPagesEditor from "./PublicPagesEditor";

export default async function PublicPagesPage(){
 const s=await createSupabaseServerClient();
 const{data:{user}}=await s.auth.getUser();if(!user)redirect("/admin/login");
 const{data:profile}=await s.from("profiles").select("role,status").eq("id",user.id).single();
 if(!profile||profile.status!=="active"||profile.role!=="super_admin")redirect("/admin");
 return <PublicPagesEditor/>;
}
