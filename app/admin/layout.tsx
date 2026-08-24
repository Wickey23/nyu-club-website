import "./admin.css";
import "./drive.css";
import "./admin-cleanup.css";
import { createSupabaseServerClient } from "../lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let canImportDrive=false;
  try {
    const supabase=await createSupabaseServerClient();
    const { data:{user} }=await supabase.auth.getUser();
    if(user){
      const {data:profile}=await supabase.from("profiles").select("role,status").eq("id",user.id).single();
      canImportDrive=Boolean(profile&&profile.status==="active"&&["super_admin","admin","media_manager"].includes(profile.role));
    }
  } catch {}

  return <>
    {children}
    {canImportDrive&&<a className="admin-drive-shortcut" href="/admin/drive">Drive folder import</a>}
  </>;
}
