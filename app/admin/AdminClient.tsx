"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  rsvpUrl: string;
  status: "draft" | "published";
};

type TeamItem = { id: string; name: string; role: string; email: string; image: string };
type GalleryItem = { id: string; title: string; image: string; description: string; sourceUrl?: string };
type SiteContent = {
  homepage: { headline: string; description: string; heroImage: string; featuredEventId: string };
  events: EventItem[];
  team: TeamItem[];
  gallery: GalleryItem[];
  settings: { clubName: string; shortName: string; email: string; instagram: string; linkedin: string };
};

const emptyContent: SiteContent = {
  homepage: { headline: "", description: "", heroImage: "", featuredEventId: "" },
  events: [], team: [], gallery: [],
  settings: { clubName: "", shortName: "", email: "", instagram: "", linkedin: "" },
};

const nav = ["Overview", "Homepage", "Events", "Team", "Gallery", "Settings"] as const;
type Tab = (typeof nav)[number];

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;
}

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error || "Unable to sign in.");
    window.location.reload();
  }

  return <main className="cms-login-shell">
    <section className="cms-login-card">
      <img src="/nyu-peruvian-logo.webp" alt="NYU Peruvian Student Association logo" className="cms-login-logo" />
      <span className="cms-kicker">Board portal</span>
      <h1>¡Viva Perú! Admin</h1>
      <p>Restricted to approved NYU Peruvian Student Association board members.</p>
      <form onSubmit={submit} className="cms-form-stack">
        <label>Approved board email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@nyu.edu" required /></label>
        <label>Club admin password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
        {error && <div className="cms-error">{error}</div>}
        <button className="cms-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <a href="/" className="cms-back">← Back to website</a>
    </section>
  </main>;
}

export function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [content, setContent] = useState<SiteContent>(emptyContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => { void load(); }, []);
  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/content", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setContent(data.content);
    else setMessage(data.error || "Unable to load site content.");
    setLoading(false); setDirty(false);
  }
  function update(next: SiteContent) { setContent(next); setDirty(true); setMessage(""); }
  async function save() {
    setSaving(true); setMessage("");
    const res = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
    const data = await res.json(); setSaving(false);
    if (!res.ok) return setMessage(data.error || "Save failed.");
    setDirty(false); setMessage("Saved. Vercel will publish the update automatically from GitHub.");
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.reload(); }

  const published = useMemo(() => content.events.filter(e=>e.status === "published").length, [content.events]);

  return <main className="cms-shell">
    <aside className="cms-sidebar">
      <div className="cms-brand"><img src="/nyu-peruvian-logo.webp" alt=""/><div><strong>¡Viva Perú!</strong><span>Board CMS</span></div></div>
      <nav>{nav.map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}>{item}</button>)}</nav>
      <div className="cms-sidebar-bottom"><span>Signed in as</span><strong>{adminEmail}</strong><button onClick={logout}>Sign out</button></div>
    </aside>

    <section className="cms-main">
      <header className="cms-topbar">
        <div><span className="cms-kicker">Content management</span><h1>{tab}</h1></div>
        <div className="cms-top-actions"><a href="/" target="_blank">View site ↗</a><button className="cms-primary" onClick={save} disabled={saving || !dirty}>{saving ? "Saving…" : dirty ? "Save & publish" : "Saved"}</button></div>
      </header>
      {message && <div className={message.startsWith("Saved")?"cms-success":"cms-notice"}>{message}</div>}
      {loading ? <div className="cms-loading">Loading club content…</div> : <>
        {tab === "Overview" && <Overview content={content} published={published} setTab={setTab}/>} 
        {tab === "Homepage" && <HomepageEditor content={content} update={update}/>} 
        {tab === "Events" && <EventsEditor content={content} update={update}/>} 
        {tab === "Team" && <TeamEditor content={content} update={update}/>} 
        {tab === "Gallery" && <GalleryEditor content={content} update={update}/>} 
        {tab === "Settings" && <SettingsEditor content={content} update={update}/>} 
      </>}
    </section>
  </main>;
}

function Overview({content,published,setTab}:{content:SiteContent;published:number;setTab:(t:Tab)=>void}) {
  return <>
    <div className="cms-stat-grid">
      <article><strong>{content.events.length}</strong><span>Total events</span></article>
      <article><strong>{published}</strong><span>Published events</span></article>
      <article><strong>{content.team.length}</strong><span>Board members</span></article>
      <article><strong>{content.gallery.length}</strong><span>Gallery items</span></article>
    </div>
    <section className="cms-panel"><div className="cms-panel-head"><div><span className="cms-kicker">Quick actions</span><h2>Manage the website</h2></div></div><div className="cms-action-grid">
      <button onClick={()=>setTab("Homepage")}><b>Homepage</b><span>Hero, copy and featured event</span></button>
      <button onClick={()=>setTab("Events")}><b>Events</b><span>Create, publish and update events</span></button>
      <button onClick={()=>setTab("Team")}><b>Board</b><span>Names, roles, email and portraits</span></button>
      <button onClick={()=>setTab("Gallery")}><b>Gallery</b><span>Upload and source club photography</span></button>
    </div></section>
    <section className="cms-panel"><div className="cms-panel-head"><div><span className="cms-kicker">Access</span><h2>Verified board workspace</h2></div></div><p className="cms-muted">Only emails listed in the Vercel <code>ADMIN_EMAILS</code> environment variable can sign in. A board email plus the shared club admin password is required. Sessions are signed server-side and expire automatically.</p></section>
  </>;
}

function Field({label,value,onChange,multiline=false,placeholder=""}:{label:string;value:string;onChange:(v:string)=>void;multiline?:boolean;placeholder?:string}) {
  return <label className="cms-field"><span>{label}</span>{multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>:<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}</label>;
}

function MediaField({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {
  const [busy,setBusy]=useState(false); const [err,setErr]=useState("");
  async function upload(file?:File){ if(!file)return; setBusy(true);setErr("");const form=new FormData();form.append("file",file);const res=await fetch("/api/admin/media",{method:"POST",body:form});const data=await res.json();setBusy(false);if(!res.ok)return setErr(data.error||"Upload failed");onChange(data.url);}
  return <div className="cms-media-field"><Field label={label} value={value} onChange={onChange} placeholder="Paste an image URL or upload below"/><div className="cms-upload-row"><label className="cms-upload">{busy?"Uploading…":"Upload image"}<input type="file" accept="image/*" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/></label>{value&&<div className="cms-thumb" style={{backgroundImage:`url(${value})`}}/>}</div>{err&&<small className="cms-error-text">{err}</small>}</div>;
}

function HomepageEditor({content,update}:{content:SiteContent;update:(c:SiteContent)=>void}) {
  const h=content.homepage; const set=(key:keyof typeof h,value:string)=>update({...content,homepage:{...h,[key]:value}});
  return <section className="cms-panel"><div className="cms-panel-head"><div><span className="cms-kicker">Public homepage</span><h2>Hero & featured content</h2></div></div><div className="cms-form-grid">
    <Field label="Homepage headline" value={h.headline} onChange={v=>set("headline",v)}/>
    <Field label="Description" value={h.description} onChange={v=>set("description",v)} multiline/>
    <MediaField label="Hero image" value={h.heroImage} onChange={v=>set("heroImage",v)}/>
    <label className="cms-field"><span>Featured event</span><select value={h.featuredEventId} onChange={e=>set("featuredEventId",e.target.value)}><option value="">None</option>{content.events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
  </div></section>;
}

function EventsEditor({content,update}:{content:SiteContent;update:(c:SiteContent)=>void}) {
  function add(){const e:EventItem={id:`event-${Date.now()}`,title:"New event",date:"",time:"",location:"NYU · New York",description:"",image:"",rsvpUrl:"",status:"draft"};update({...content,events:[e,...content.events]});}
  function patch(i:number,p:Partial<EventItem>){const events=[...content.events];events[i]={...events[i],...p};update({...content,events});}
  function remove(i:number){if(!confirm("Delete this event?"))return;update({...content,events:content.events.filter((_,x)=>x!==i)});}
  return <><div className="cms-section-actions"><p>Create events here, then publish them when details are final.</p><button className="cms-primary" onClick={add}>+ New event</button></div><div className="cms-card-stack">{content.events.map((e,i)=><section className="cms-editor-card" key={e.id}><div className="cms-card-title"><div><span className={`cms-status ${e.status}`}>{e.status}</span><h2>{e.title||"Untitled event"}</h2></div><div><button onClick={()=>patch(i,{status:e.status==="published"?"draft":"published"})}>{e.status==="published"?"Move to draft":"Publish"}</button><button className="danger" onClick={()=>remove(i)}>Delete</button></div></div><div className="cms-form-grid two"><Field label="Event name" value={e.title} onChange={v=>patch(i,{title:v,id:e.id.startsWith("event-")?slug(v):e.id})}/><Field label="Date" value={e.date} onChange={v=>patch(i,{date:v})}/><Field label="Time" value={e.time} onChange={v=>patch(i,{time:v})}/><Field label="Location" value={e.location} onChange={v=>patch(i,{location:v})}/><Field label="Description" value={e.description} onChange={v=>patch(i,{description:v})} multiline/><Field label="RSVP URL" value={e.rsvpUrl} onChange={v=>patch(i,{rsvpUrl:v})}/><MediaField label="Event image" value={e.image} onChange={v=>patch(i,{image:v})}/></div></section>)}</div></>;
}

function TeamEditor({content,update}:{content:SiteContent;update:(c:SiteContent)=>void}) {
  function add(){update({...content,team:[...content.team,{id:`member-${Date.now()}`,name:"New board member",role:"Board Member",email:"",image:""}]});}
  function patch(i:number,p:Partial<TeamItem>){const team=[...content.team];team[i]={...team[i],...p};update({...content,team});}
  function remove(i:number){if(confirm("Remove this board member from the site?"))update({...content,team:content.team.filter((_,x)=>x!==i)});}
  return <><div className="cms-section-actions"><p>Keep current board leadership accurate and upload official portraits.</p><button className="cms-primary" onClick={add}>+ Add board member</button></div><div className="cms-team-editor">{content.team.map((m,i)=><article className="cms-editor-card" key={m.id}><div className="cms-member-preview" style={{backgroundImage:m.image?`url(${m.image})`:undefined}}/><Field label="Name" value={m.name} onChange={v=>patch(i,{name:v})}/><Field label="Role" value={m.role} onChange={v=>patch(i,{role:v})}/><Field label="Email" value={m.email} onChange={v=>patch(i,{email:v})}/><MediaField label="Portrait" value={m.image} onChange={v=>patch(i,{image:v})}/><button className="cms-delete" onClick={()=>remove(i)}>Remove member</button></article>)}</div></>;
}

function GalleryEditor({content,update}:{content:SiteContent;update:(c:SiteContent)=>void}) {
  function add(){update({...content,gallery:[{id:`photo-${Date.now()}`,title:"New photo",image:"",description:"",sourceUrl:""},...content.gallery]});}
  function patch(i:number,p:Partial<GalleryItem>){const gallery=[...content.gallery];gallery[i]={...gallery[i],...p};update({...content,gallery});}
  function remove(i:number){if(confirm("Delete this gallery item?"))update({...content,gallery:content.gallery.filter((_,x)=>x!==i)});}
  return <><div className="cms-section-actions"><p>Upload originals or paste sourced image URLs. Keep the original social/source link attached.</p><button className="cms-primary" onClick={add}>+ Add gallery item</button></div><div className="cms-gallery-editor">{content.gallery.map((g,i)=><article className="cms-editor-card" key={g.id}><div className="cms-gallery-preview" style={{backgroundImage:g.image?`url(${g.image})`:undefined}}/><Field label="Title / event" value={g.title} onChange={v=>patch(i,{title:v})}/><Field label="Description / caption" value={g.description} onChange={v=>patch(i,{description:v})} multiline/><MediaField label="Image" value={g.image} onChange={v=>patch(i,{image:v})}/><Field label="Original Instagram / source URL" value={g.sourceUrl||""} onChange={v=>patch(i,{sourceUrl:v})}/><button className="cms-delete" onClick={()=>remove(i)}>Delete item</button></article>)}</div></>;
}

function SettingsEditor({content,update}:{content:SiteContent;update:(c:SiteContent)=>void}) {
  const s=content.settings;const set=(key:keyof typeof s,value:string)=>update({...content,settings:{...s,[key]:value}});
  return <section className="cms-panel"><div className="cms-panel-head"><div><span className="cms-kicker">Global information</span><h2>Club settings</h2></div></div><div className="cms-form-grid two"><Field label="Official organization name" value={s.clubName} onChange={v=>set("clubName",v)}/><Field label="Display name" value={s.shortName} onChange={v=>set("shortName",v)}/><Field label="Public email" value={s.email} onChange={v=>set("email",v)}/><Field label="Instagram URL" value={s.instagram} onChange={v=>set("instagram",v)}/><Field label="LinkedIn URL" value={s.linkedin} onChange={v=>set("linkedin",v)}/></div><div className="cms-security-note"><b>Board access is managed in Vercel.</b><span>Add/remove verified board emails through <code>ADMIN_EMAILS</code>. Never put passwords or tokens in this content editor.</span></div></section>;
}
