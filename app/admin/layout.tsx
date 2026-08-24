import "./admin.css";
import "./drive.css";
import "./admin-cleanup.css";
import { createSupabaseServerClient } from "../lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let canImportDrive=false;
  let canRecover=false;
  let canPublish=false;
  try {
    const supabase=await createSupabaseServerClient();
    const { data:{user} }=await supabase.auth.getUser();
    if(user){
      const {data:profile}=await supabase.from("profiles").select("role,status").eq("id",user.id).single();
      const active=Boolean(profile&&profile.status==="active");
      canImportDrive=Boolean(active&&profile&&["super_admin","admin","media_manager"].includes(profile.role));
      canRecover=Boolean(active&&profile&&["super_admin","admin"].includes(profile.role));
      canPublish=Boolean(active&&profile&&["super_admin","admin","events_manager"].includes(profile.role));
    }
  } catch {}

  return <>
    {children}
    <div className="admin-floating-tools">
      {canPublish&&<a className="admin-drive-shortcut" href="/admin/publishing">Publishing</a>}
      {canRecover&&<a className="admin-drive-shortcut" href="/admin/recovery">Recovery</a>}
      {canImportDrive&&<a className="admin-drive-shortcut" href="/admin/drive">Drive import</a>}
    </div>
  </>;
}
