"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type AdminRole = "super_admin"|"admin"|"events_manager"|"media_manager"|"team_manager";
type EventItem = { id:string; title:string; date:string; time:string; location:string; description:string; image:string; rsvpUrl:string; status:string };
type TeamItem = { id:string; name:string; role:string; email:string; image:string };
type GalleryItem = { id:string; title:string; image:string; description:string; sourceUrl?:string };
type SiteContent = {
  homepage:{ headline:string; description:string; heroImage:string; featuredEventId:string };
  events:EventItem[];
  team:TeamItem[];
  gallery:GalleryItem[];
  settings:{ clubName:string; shortName:string; email:string; instagram:string; linkedin:string };
};

const emptyContent: SiteContent = {
  homepage:{ headline:"", description:"", heroImage:"", featuredEventId:"" },
  events:[],
  team:[],
  gallery:[],
  settings:{ clubName:"", shortName:"", email:"", instagram:"", linkedin:"" },
};

const allTabs = ["Dashboard","Homepage","Events","Team","Gallery","Settings"] as const;
type Tab = typeof allTabs[number];

const blankEvent = (): EventItem => ({ id:`event-${Date.now()}`, title:"New event", date:"", time:"", location:"NYU · New York", description:"", image:"", rsvpUrl:"", status:"draft" });
const blankMember = (): TeamItem => ({ id:`member-${Date.now()}`, name:"New board member", role:"Board Member", email:"", image:"" });

function tabsForRole(role:AdminRole): Tab[] {
  if (role === "super_admin" || role === "admin") return [...allTabs];
  if (role === "events_manager") return ["Dashboard","Events"];
  if (role === "media_manager") return ["Dashboard","Gallery"];
  if (role === "team_manager") return ["Dashboard","Team"];
  return ["Dashboard"];
}

function roleLabel(role:AdminRole) {
  return ({super_admin:"Super Admin",admin:"Admin",events_manager:"Events Manager",media_manager:"Media Manager",team_manager:"Team Manager"} as Record<AdminRole,string>)[role];
}

export default function AdminDashboard({ adminEmail, adminRole }: { adminEmail:string; adminRole:AdminRole }) {
  const [content,setContent] = useState<SiteContent>(emptyContent);
  const [tab,setTab] = useState<Tab>("Dashboard");
  const [message,setMessage] = useState("");
  const [saving,setSaving] = useState(false);
  const [loading,setLoading] = useState(true);
  const [loadFailed,setLoadFailed] = useState(false);
  const tabs = useMemo(()=>tabsForRole(adminRole),[adminRole]);
  const canManageAll = adminRole === "super_admin" || adminRole === "admin";
  const canManageEvents = canManageAll || adminRole === "events_manager";
  const canManageTeam = canManageAll || adminRole === "team_manager";
  const canManageGallery = canManageAll || adminRole === "media_manager";

  useEffect(()=>{(async()=>{
    const response=await fetch("/api/admin/content",{cache:"no-store"});
    const data=await response.json();
    if(response.ok) {
      setContent(data.content);
      setLoadFailed(false);
    } else {
      setMessage(data.error||"Unable to load CMS content.");
      setLoadFailed(true);
    }
    setLoading(false);
  })()},[]);

  const stats = useMemo(()=>({
    events:content.events.length,
    published:content.events.filter((e)=>e.status==="published").length,
    team:content.team.length,
    photos:content.gallery.length,
  }),[content]);

  async function save() {
    setSaving(true); setMessage("Saving…");
    const response=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(content)});
    const data=await response.json();
    setSaving(false);
    setMessage(response.ok ? "Saved to Supabase. Published content is now live on the website." : (data.error||"Save failed."));
  }

  async function upload(event:ChangeEvent<HTMLInputElement>, apply:(url:string)=>void) {
    const file=event.target.files?.[0]; if(!file) return;
    setMessage("Uploading image…");
    const form=new FormData(); form.append("file",file);
    const response=await fetch("/api/admin/media",{method:"POST",body:form});
    const data=await response.json();
    if(!response.ok) return setMessage(data.error||"Upload failed.");
    apply(data.url); setMessage("Image uploaded to Supabase Storage. Click Save changes to use it on the site.");
  }

  async function logout(){ await fetch("/api/admin/logout",{method:"POST"}); location.href="/admin/login"; }

  if(loading) return <main className="admin-loading">Loading board portal…</main>;
  if(loadFailed) return <main className="admin-loading">{message || "CMS unavailable."}</main>;

  return <main className="cms-shell">
    <aside className="cms-sidebar">
      <div className="cms-brand"><img src="/nyu-peruvian-logo.webp" alt=""/><div><b>¡Viva Perú!</b><span>Board CMS</span></div></div>
      <nav>
        {tabs.map(item=><button key={item} onClick={()=>setTab(item)} className={tab===item?"active":""}>{item}</button>)}
        {canManageAll && <a className="cms-tool-link" href="/admin/newsletter">Newsletter <span>↗</span></a>}
        {adminRole === "super_admin" && <a className="cms-tool-link" href="/admin/users">Users & Access <span>↗</span></a>}
      </nav>
      <div className="cms-user"><span>{roleLabel(adminRole)}</span><b>{adminEmail}</b><button onClick={logout}>Sign out</button></div>
    </aside>

    <section className="cms-main">
      <header className="cms-top"><div><span className="admin-kicker">{roleLabel(adminRole)}</span><h1>{tab}</h1></div><div className="cms-actions"><a href="/" target="_blank" rel="noreferrer">View site ↗</a><button onClick={save} disabled={saving} className="admin-primary">{saving?"Saving…":"Save changes"}</button></div></header>
      {message && <div className="cms-notice">{message}</div>}

      {tab==="Dashboard" && <>
        <div className="cms-stats"><article><b>{stats.events}</b><span>Total events</span></article><article><b>{stats.published}</b><span>Published</span></article><article><b>{stats.team}</b><span>Board members</span></article><article><b>{stats.photos}</b><span>Gallery items</span></article></div>
        <div className="cms-panel"><div className="cms-panel-head"><div><span className="admin-kicker">Quick actions</span><h2>Keep the site current</h2></div></div><div className="quick-grid">
          {canManageEvents&&<button onClick={()=>{setContent({...content,events:[blankEvent(),...content.events]});setTab("Events")}}>＋ Add event</button>}
          {canManageTeam&&<button onClick={()=>{setContent({...content,team:[...content.team,blankMember()]});setTab("Team")}}>＋ Add board member</button>}
          {canManageGallery&&<button onClick={()=>setTab("Gallery")}>＋ Add gallery photo</button>}
          {canManageAll&&<button onClick={()=>setTab("Homepage")}>Edit homepage</button>}
          {canManageAll&&<a className="quick-link" href="/admin/newsletter">Create newsletter ↗</a>}
          {adminRole==="super_admin"&&<a className="quick-link" href="/admin/users">Manage access ↗</a>}
        </div></div>
        <div className="cms-panel"><span className="admin-kicker">Publishing</span><h2>How updates work</h2><p>Content is stored directly in Supabase. When you save, published events, team information, gallery items and site settings are available to the public site immediately. Uploaded photos are stored in the club&apos;s Supabase Storage bucket.</p></div>
      </>}

      {tab==="Homepage" && canManageAll && <div className="cms-panel form-stack"><label>Homepage headline<textarea value={content.homepage.headline} onChange={e=>setContent({...content,homepage:{...content.homepage,headline:e.target.value}})}/></label><label>Intro description<textarea value={content.homepage.description} onChange={e=>setContent({...content,homepage:{...content.homepage,description:e.target.value}})}/></label><label>Hero image URL<input value={content.homepage.heroImage} onChange={e=>setContent({...content,homepage:{...content.homepage,heroImage:e.target.value}})}/></label><label className="upload-field">Upload new hero image<input type="file" accept="image/*" onChange={e=>upload(e,url=>setContent({...content,homepage:{...content.homepage,heroImage:url}}))}/></label><label>Featured event<select value={content.homepage.featuredEventId} onChange={e=>setContent({...content,homepage:{...content.homepage,featuredEventId:e.target.value}})}><option value="">No featured event</option>{content.events.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>{content.homepage.heroImage && <img className="cms-preview" src={content.homepage.heroImage} alt="Homepage hero preview"/>}</div>}

      {tab==="Events" && canManageEvents && <div className="editor-list"><button className="admin-primary add-button" onClick={()=>setContent({...content,events:[blankEvent(),...content.events]})}>＋ Add event</button>{content.events.map((item,index)=><article className="cms-panel editor-card" key={item.id}><div className="editor-card-head"><div><span className="status-pill">{item.status}</span><h2>{item.title||"Untitled event"}</h2></div><button className="danger" onClick={()=>setContent({...content,events:content.events.filter((_,i)=>i!==index)})}>Delete</button></div><div className="field-grid"><label>Title<input value={item.title} onChange={e=>patchEvent(index,{title:e.target.value})}/></label><label>Status<select value={item.status} onChange={e=>patchEvent(index,{status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option><option value="past">Past</option></select></label><label>Date<input type="date" value={item.date} onChange={e=>patchEvent(index,{date:e.target.value})}/></label><label>Time<input type="time" value={item.time} onChange={e=>patchEvent(index,{time:e.target.value})}/></label><label>Location<input value={item.location} onChange={e=>patchEvent(index,{location:e.target.value})}/></label><label>RSVP URL<input value={item.rsvpUrl} onChange={e=>patchEvent(index,{rsvpUrl:e.target.value})}/></label></div><label>Description<textarea value={item.description} onChange={e=>patchEvent(index,{description:e.target.value})}/></label><label>Image URL<input value={item.image} onChange={e=>patchEvent(index,{image:e.target.value})}/></label><label className="upload-field">Upload event image<input type="file" accept="image/*" onChange={e=>upload(e,url=>patchEvent(index,{image:url}))}/></label>{item.image&&<img className="cms-preview small" src={item.image} alt=""/>}</article>)}</div>}

      {tab==="Team" && canManageTeam && <div className="editor-list"><button className="admin-primary add-button" onClick={()=>setContent({...content,team:[...content.team,blankMember()]})}>＋ Add board member</button>{content.team.map((item,index)=><article className="cms-panel team-editor" key={item.id}>{item.image?<img src={item.image} alt=""/>:<div className="member-placeholder">Photo</div>}<div className="form-stack"><div className="field-grid"><label>Name<input value={item.name} onChange={e=>patchTeam(index,{name:e.target.value})}/></label><label>Role<input value={item.role} onChange={e=>patchTeam(index,{role:e.target.value})}/></label><label>Email<input type="email" value={item.email} onChange={e=>patchTeam(index,{email:e.target.value})}/></label><label>Image URL<input value={item.image} onChange={e=>patchTeam(index,{image:e.target.value})}/></label></div><label className="upload-field">Upload portrait<input type="file" accept="image/*" onChange={e=>upload(e,url=>patchTeam(index,{image:url}))}/></label><button className="danger inline" onClick={()=>setContent({...content,team:content.team.filter((_,i)=>i!==index)})}>Remove member</button></div></article>)}</div>}

      {tab==="Gallery" && canManageGallery && <div className="cms-panel"><div className="cms-panel-head"><div><span className="admin-kicker">Media library</span><h2>Gallery photos</h2></div><label className="admin-primary file-button">＋ Upload photo<input type="file" accept="image/*" onChange={e=>upload(e,url=>setContent({...content,gallery:[{id:`photo-${Date.now()}`,title:"New photo",image:url,description:"",sourceUrl:""},...content.gallery]}))}/></label></div><div className="gallery-editor-grid">{content.gallery.map((item,index)=><article key={item.id}><img src={item.image} alt=""/><input value={item.title} onChange={e=>patchGallery(index,{title:e.target.value})}/><textarea placeholder="Caption / description" value={item.description} onChange={e=>patchGallery(index,{description:e.target.value})}/><input placeholder="Instagram or source URL" value={item.sourceUrl||""} onChange={e=>patchGallery(index,{sourceUrl:e.target.value})}/><button className="danger inline" onClick={()=>setContent({...content,gallery:content.gallery.filter((_,i)=>i!==index)})}>Remove</button></article>)}</div>{!content.gallery.length&&<p className="empty-state">No gallery photos yet. Upload the first one.</p>}</div>}

      {tab==="Settings" && canManageAll && <div className="cms-panel form-stack"><label>Official club name<input value={content.settings.clubName} onChange={e=>setContent({...content,settings:{...content.settings,clubName:e.target.value}})}/></label><label>Public short name<input value={content.settings.shortName} onChange={e=>setContent({...content,settings:{...content.settings,shortName:e.target.value}})}/></label><label>Club email<input type="email" value={content.settings.email} onChange={e=>setContent({...content,settings:{...content.settings,email:e.target.value}})}/></label><label>Instagram URL<input value={content.settings.instagram} onChange={e=>setContent({...content,settings:{...content.settings,instagram:e.target.value}})}/></label><label>LinkedIn URL<input value={content.settings.linkedin} onChange={e=>setContent({...content,settings:{...content.settings,linkedin:e.target.value}})}/></label><div className="logo-setting"><img src="/nyu-peruvian-logo.webp" alt="NYU Peruvian Student Association logo"/><div><b>Official logo</b><p>The club logo is used across the public site and board portal.</p></div></div></div>}
    </section>
  </main>;

  function patchEvent(index:number, patch:Partial<EventItem>){ const events=[...content.events]; events[index]={...events[index],...patch}; setContent({...content,events}); }
  function patchTeam(index:number, patch:Partial<TeamItem>){ const team=[...content.team]; team[index]={...team[index],...patch}; setContent({...content,team}); }
  function patchGallery(index:number, patch:Partial<GalleryItem>){ const gallery=[...content.gallery]; gallery[index]={...gallery[index],...patch}; setContent({...content,gallery}); }
}
