"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

type Role = "super_admin"|"admin"|"events_manager"|"media_manager"|"team_manager"|"viewer";
type Profile = { id:string; email:string; display_name:string|null; role:Role; status:"invited"|"active"|"disabled"; created_at:string };
const roles: {value:Role;label:string}[] = [
  {value:"super_admin",label:"Super Admin"},
  {value:"admin",label:"Admin"},
  {value:"events_manager",label:"Events Manager"},
  {value:"media_manager",label:"Media Manager"},
  {value:"team_manager",label:"Team Manager"},
  {value:"viewer",label:"Viewer"},
];

export default function UsersAccess(){
  const [users,setUsers]=useState<Profile[]>([]);
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [role,setRole]=useState<Role>("admin");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function load(){
    const supabase=createSupabaseBrowserClient();
    const {data,error}=await supabase.from("profiles").select("id,email,display_name,role,status,created_at").order("created_at",{ascending:true});
    if(error) return setMessage(error.message);
    setUsers((data||[]) as Profile[]);
  }
  useEffect(()=>{load()},[]);

  async function invite(event:FormEvent){
    event.preventDefault(); setLoading(true); setMessage("Sending invitation…");
    const supabase=createSupabaseBrowserClient();
    const {data,error}=await supabase.functions.invoke("invite-board-member",{body:{email:email.trim(),display_name:name.trim(),role,redirectTo:`${window.location.origin}/admin/activate`}});
    setLoading(false);
    if(error || data?.error) return setMessage(data?.error||error?.message||"Unable to send invitation.");
    setMessage(`Invitation sent to ${email.trim()}.`); setEmail(""); setName(""); await load();
  }

  async function updateUser(user:Profile, patch:Partial<Pick<Profile,"role"|"status"|"display_name">>){
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.from("profiles").update(patch).eq("id",user.id);
    if(error) return setMessage(error.message);
    setMessage("Access updated."); await load();
  }

  return <main style={{minHeight:"100vh",background:"#f4ede4",padding:"34px 20px 70px",fontFamily:"var(--font-sans)"}}>
    <div style={{maxWidth:1180,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",marginBottom:26,flexWrap:"wrap"}}>
        <div><span className="admin-kicker">Super Admin</span><h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2.2rem,5vw,4rem)",margin:"4px 0"}}>Users & Access</h1><p style={{margin:0,opacity:.72}}>Invite board members, assign permissions and disable access when terms change.</p></div>
        <a href="/admin" className="admin-primary" style={{textDecoration:"none"}}>← Board CMS</a>
      </div>

      {message&&<div className="cms-notice" style={{marginBottom:18}}>{message}</div>}

      <section className="cms-panel" style={{marginBottom:24}}>
        <span className="admin-kicker">Invite board member</span><h2 style={{marginTop:6}}>Send account invitation</h2>
        <form onSubmit={invite} className="field-grid">
          <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Board member name" /></label>
          <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@nyu.edu" /></label>
          <label>Access role<select value={role} onChange={e=>setRole(e.target.value as Role)}>{roles.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}</select></label>
          <div style={{display:"flex",alignItems:"end"}}><button className="admin-primary" disabled={loading} style={{width:"100%"}}>{loading?"Sending…":"Send invitation email"}</button></div>
        </form>
      </section>

      <section className="cms-panel">
        <div className="cms-panel-head"><div><span className="admin-kicker">Authorized accounts</span><h2>Board access</h2></div><b>{users.length} account{users.length===1?"":"s"}</b></div>
        <div style={{display:"grid",gap:12}}>{users.map(user=><article key={user.id} style={{display:"grid",gridTemplateColumns:"minmax(220px,1.4fr) minmax(170px,.8fr) minmax(150px,.7fr)",gap:12,alignItems:"center",padding:"16px 0",borderTop:"1px solid rgba(0,0,0,.09)"}}>
          <div><b style={{display:"block"}}>{user.display_name||user.email}</b><span style={{fontSize:13,opacity:.65}}>{user.email}</span></div>
          <select value={user.role} onChange={e=>updateUser(user,{role:e.target.value as Role})}>{roles.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}</select>
          <select value={user.status} onChange={e=>updateUser(user,{status:e.target.value as Profile["status"]})}><option value="invited">Invited</option><option value="active">Active</option><option value="disabled">Disabled</option></select>
        </article>)}</div>
        {!users.length&&<p className="empty-state">No board accounts have been created yet.</p>}
      </section>
    </div>
  </main>;
}
