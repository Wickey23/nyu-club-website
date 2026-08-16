import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

async function saveFacebook(formData:FormData){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("profiles").select("role,status").eq("id",user.id).single();
  if(!profile||profile.status!=="active"||profile.role!=="super_admin")redirect("/admin");
  const facebook=String(formData.get("facebook")||"").trim();
  if(facebook&&!/^https?:\/\//i.test(facebook))redirect("/admin/facebook?error=url");
  const{error}=await supabase.from("site_settings").update({facebook,updated_by:user.id}).eq("id",1);
  if(error)redirect("/admin/facebook?error=save");
  await supabase.from("audit_log").insert({actor_id:user.id,action:"update_facebook",entity_type:"site_settings",metadata:{facebook}});
  redirect("/admin/facebook?saved=1");
}

export default async function FacebookSettingsPage({searchParams}:{searchParams:Promise<{saved?:string;error?:string}>}){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("profiles").select("role,status,email").eq("id",user.id).single();
  if(!profile||profile.status!=="active"||profile.role!=="super_admin")redirect("/admin");
  const{data:settings}=await supabase.from("site_settings").select("facebook").eq("id",1).single();
  const params=await searchParams;
  return <main className="cms-main" style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>
    <header className="cms-top"><div><span className="admin-kicker">Super Admin</span><h1>Facebook</h1><p>Add or update the club&apos;s official Facebook page.</p></div><div className="cms-actions"><a href="/admin">← Back to Admin</a><a href="/" target="_blank" rel="noreferrer">View site ↗</a></div></header>
    {params.saved&&<div className="cms-notice">Facebook page saved. The public footer is updated.</div>}
    {params.error==="url"&&<div className="cms-notice">Enter the full Facebook URL beginning with https://</div>}
    {params.error==="save"&&<div className="cms-notice">Unable to save the Facebook page. Try again.</div>}
    <section className="cms-panel form-stack">
      <span className="admin-kicker">Social links</span><h2>Official Facebook page</h2>
      <p>Leave this blank to hide Facebook from the public website.</p>
      <form action={saveFacebook} className="form-stack">
        <label>Facebook page URL<input name="facebook" type="url" placeholder="https://www.facebook.com/yourpage" defaultValue={settings?.facebook||""}/></label>
        <button className="admin-primary" type="submit">Save Facebook page</button>
      </form>
    </section>
  </main>;
}
