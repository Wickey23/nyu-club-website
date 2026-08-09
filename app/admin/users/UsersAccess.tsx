"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
const permissions = [
  {role:"Super Admin",scope:"Everything",details:"Full CMS access, users, roles, Super Admin assignments, newsletter, settings and all content."},
  {role:"Admin",scope:"Full site management",details:"Manage all site content, newsletter and non-Super-Admin accounts. Cannot grant, demote or disable Super Admin access."},
  {role:"Events Manager",scope:"Events only",details:"Create, edit, publish and remove events. No access to team, gallery, settings, newsletter or users."},
  {role:"Media Manager",scope:"Gallery only",details:"Manage gallery images/videos and media. No access to events, team, settings, newsletter or users."},
  {role:"Team Manager",scope:"Team only",details:"Manage public board/team profiles. No access to events, gallery, settings, newsletter or users."},
  {role:"Viewer",scope:"No CMS editing",details:"Account can remain authorized in the directory but cannot enter the CMS editor or change site content, newsletters, settings or roles."},
];

export default function UsersAccess({actorRole}:{actorRole:"super_admin"|"admin"}){
  const [users,setUsers]=useState<Profile[]>([]);
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [role,setRole]=useState<Role>("admin");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  const assignableRoles = useMemo(()=>actorRole==="super_admin"?roles:roles.filter(r=>r.value!=="super_admin"),[actorRole]);

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
    if(actorRole==="admin" && (user.role==="super_admin" || patch.role==="super_admin")) return setMessage("Only a Super Admin can change Super Admin access.");
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.from("profiles").update(patch).eq("id",user.id);
    if(error) return setMessage(error.message);
    setMessage("Access updated."); await load();
  }

  return <main className="access-page">
    <div className="access-wrap">
      <div className="access-head">
        <div><span className="admin-kicker">{actorRole==="super_admin"?"Super Admin":"Admin"}</span><h1>Users & Access</h1><p>Invite board members, assign roles and control who can change the club website.</p></div>
        <a href="/admin" className="admin-primary">← Board CMS</a>
      </div>

      {message&&<div className="cms-notice">{message}</div>}

      <section className="cms-panel">
        <span className="admin-kicker">Permissions</span><h2>What each role can do</h2>
        <div className="role-matrix">{permissions.map(item=><article key={item.role}><div><b>{item.role}</b><span>{item.scope}</span></div><p>{item.details}</p></article>)}</div>
        <div className="access-rule"><b>Role-control rule</b><p>Only Super Admins and Admins can change user roles or account status. Admins cannot create, modify, demote or disable a Super Admin.</p></div>
      </section>

      <section className="cms-panel">
        <span className="admin-kicker">Invite board member</span><h2>Send account invitation</h2>
        <form onSubmit={invite} className="field-grid">
          <label>Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Board member name" /></label>
          <label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@nyu.edu" /></label>
          <label>Access role<select value={role} onChange={e=>setRole(e.target.value as Role)}>{assignableRoles.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}</select></label>
          <div className="access-submit"><button className="admin-primary" disabled={loading}>{loading?"Sending…":"Send invitation email"}</button></div>
        </form>
      </section>

      <section className="cms-panel">
        <div className="cms-panel-head"><div><span className="admin-kicker">Authorized accounts</span><h2>Board access</h2></div><b>{users.length} account{users.length===1?"":"s"}</b></div>
        <div className="access-list">{users.map(user=>{
          const protectedSuperAdmin=actorRole==="admin"&&user.role==="super_admin";
          return <article key={user.id} className="access-row">
            <div><b>{user.display_name||user.email}</b><span>{user.email}</span></div>
            <label>Role<select value={user.role} disabled={protectedSuperAdmin} onChange={e=>updateUser(user,{role:e.target.value as Role})}>{roles.map(r=><option key={r.value} value={r.value} disabled={actorRole==="admin"&&r.value==="super_admin"}>{r.label}</option>)}</select></label>
            <label>Status<select value={user.status} disabled={protectedSuperAdmin} onChange={e=>updateUser(user,{status:e.target.value as Profile["status"]})}><option value="invited">Invited</option><option value="active">Active</option><option value="disabled">Disabled</option></select></label>
            {protectedSuperAdmin&&<small>Protected Super Admin account</small>}
          </article>})}</div>
        {!users.length&&<p className="empty-state">No board accounts have been created yet.</p>}
      </section>
    </div>
  </main>;
}
