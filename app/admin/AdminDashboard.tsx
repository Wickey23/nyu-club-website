"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { galleryImageUrl, galleryVideoEmbedUrl, isGoogleDriveUrl } from "../lib/mediaUrl";

type AdminRole = "super_admin"|"admin"|"events_manager"|"media_manager"|"team_manager";
type EventItem = { id:string; title:string; date:string; time:string; location:string; description:string; image:string; rsvpUrl:string; status:string };
type TeamItem = { id:string; name:string; role:string; email:string; image:string };
type GalleryItem = { id:string; title:string; image:string; description:string; sourceUrl?:string; mediaType?:"image"|"video" };
type SiteContent = {
  homepage:{ headline:string; description:string; heroImage:string; featuredEventId:string; videoUrl:string; videoPosterUrl:string; secondaryVideoUrl:string; secondaryVideoPosterUrl:string };
  events:EventItem[];
  team:TeamItem[];
  gallery:GalleryItem[];
  settings:{ clubName:string; shortName:string; email:string; instagram:string; linkedin:string };
};

const emptyContent: SiteContent = {
  homepage:{headline:"",description:"",heroImage:"",featuredEventId:"",videoUrl:"",videoPosterUrl:"",secondaryVideoUrl:"",secondaryVideoPosterUrl:""},
  events:[],team:[],gallery:[],settings:{clubName:"",shortName:"",email:"",instagram:"",linkedin:""},
};
const allTabs=["Dashboard","Homepage","Events","Team","Gallery","Settings"] as const;
type Tab=typeof allTabs[number];
const blankEvent=():EventItem=>({id:`event-${Date.now()}`,title:"New event",date:"",time:"",location:"NYU · New York",description:"",image:"",rsvpUrl:"",status:"draft"});
const blankMember=():TeamItem=>({id:`member-${Date.now()}`,name:"New board member",role:"Board Member",email:"",image:""});
const blankMedia=(type:"image"|"video"="image"):GalleryItem=>({id:`media-${Date.now()}`,title:type==="video"?"New video":"New photo",image:"",description:"",sourceUrl:"",mediaType:type});

function tabsForRole(role:AdminRole):Tab[]{
  if(role==="super_admin"||role==="admin") return [...allTabs];
  if(role==="events_manager") return ["Dashboard","Events"];
  if(role==="media_manager") return ["Dashboard","Gallery"];
  if(role==="team_manager") return ["Dashboard","Team"];
  return ["Dashboard"];
}
function roleLabel(role:AdminRole){return({super_admin:"Super Admin",admin:"Admin",events_manager:"Events Manager",media_manager:"Media Manager",team_manager:"Team Manager"} as Record<AdminRole,string>)[role]}

export default function AdminDashboard({adminEmail,adminRole}:{adminEmail:string;adminRole:AdminRole}){
  const [content,setContent]=useState<SiteContent>(emptyContent);
  const [tab,setTab]=useState<Tab>("Dashboard");
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const [menuOpen,setMenuOpen]=useState(false);
  const tabs=useMemo(()=>tabsForRole(adminRole),[adminRole]);
  const canManageAll=adminRole==="super_admin"||adminRole==="admin";
  const canManageEvents=canManageAll||adminRole==="events_manager";
  const canManageTeam=canManageAll||adminRole==="team_manager";
  const canManageGallery=canManageAll||adminRole==="media_manager";

  useEffect(()=>{(async()=>{
    const response=await fetch("/api/admin/content",{cache:"no-store"});
    const data=await response.json();
    if(response.ok) setContent({...data.content,homepage:{...emptyContent.homepage,...data.content.homepage},gallery:(data.content.gallery||[]).map((g:GalleryItem)=>({...g,mediaType:g.mediaType||"image"}))});
    else setMessage(data.error||"Unable to load CMS content.");
    setLoading(false);
  })()},[]);

  const stats=useMemo(()=>({events:content.events.length,published:content.events.filter(e=>e.status==="published").length,team:content.team.length,photos:content.gallery.filter(g=>g.mediaType!=="video").length,videos:content.gallery.filter(g=>g.mediaType==="video").length}),[content]);
  const patchEvent=(index:number,patch:Partial<EventItem>)=>setContent({...content,events:content.events.map((v,i)=>i===index?{...v,...patch}:v)});
  const patchTeam=(index:number,patch:Partial<TeamItem>)=>setContent({...content,team:content.team.map((v,i)=>i===index?{...v,...patch}:v)});
  const patchGallery=(index:number,patch:Partial<GalleryItem>)=>setContent({...content,gallery:content.gallery.map((v,i)=>i===index?{...v,...patch}:v)});

  async function save(){setSaving(true);setMessage("Saving…");const response=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(content)});const data=await response.json();setSaving(false);setMessage(response.ok?"Saved. Published changes are live.":(data.error||"Save failed."));}
  async function upload(event:ChangeEvent<HTMLInputElement>,apply:(url:string)=>void){const file=event.target.files?.[0];if(!file)return;setMessage("Uploading…");const form=new FormData();form.append("file",file);const response=await fetch("/api/admin/media",{method:"POST",body:form});const data=await response.json();if(!response.ok)return setMessage(data.error||"Upload failed.");apply(data.url);setMessage("Uploaded. Click Save changes to publish it.");}
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});location.href="/admin/login";}
  function chooseTab(next:Tab){setTab(next);setMenuOpen(false);}

  if(loading)return <main className="admin-loading">Loading board portal…</main>;
  const brand=content.settings.shortName || content.settings.clubName || "NYU Perú";

  return <main className="cms-shell">
    <aside className={`cms-sidebar ${menuOpen?"open":""}`}>
      <div className="cms-brand"><img src="/nyu-peruvian-logo-v4.svg" alt=""/><div><b>{brand}</b><span>Board CMS</span></div><button className="cms-menu-close" onClick={()=>setMenuOpen(false)}>×</button></div>
      <nav>{tabs.map(item=><button key={item} onClick={()=>chooseTab(item)} className={tab===item?"active":""}>{item}</button>)}{canManageAll&&<a className="cms-tool-link" href="/admin/newsletter">Newsletter <span>↗</span></a>}{canManageAll&&<a className="cms-tool-link" href="/admin/users">Users & Access <span>↗</span></a>}</nav>
      <div className="cms-user"><span>{roleLabel(adminRole)}</span><b>{adminEmail}</b><button onClick={logout}>Sign out</button></div>
    </aside>
    {menuOpen&&<button className="cms-backdrop" onClick={()=>setMenuOpen(false)} aria-label="Close menu"/>}

    <section className="cms-main">
      <div className="cms-mobilebar"><button onClick={()=>setMenuOpen(true)}>☰</button><div><b>{brand}</b><span>{roleLabel(adminRole)}</span></div><button onClick={save} disabled={saving}>{saving?"…":"Save"}</button></div>
      <header className="cms-top"><div><span className="admin-kicker">{roleLabel(adminRole)}</span><h1>{tab}</h1></div><div className="cms-actions"><a href="/" target="_blank" rel="noreferrer">View site ↗</a><button onClick={save} disabled={saving} className="admin-primary">{saving?"Saving…":"Save changes"}</button></div></header>
      {message&&<div className="cms-notice">{message}</div>}

      {tab==="Dashboard"&&<>
        <div className="dashboard-welcome"><div><span className="admin-kicker">Club control center</span><h2>Keep {brand} current.</h2><p>Publish events, update the board, manage media, send newsletters and control access from one place.</p></div><a href="/" target="_blank" rel="noreferrer">Open live site ↗</a></div>
        <div className="cms-stats"><article><b>{stats.events}</b><span>Total events</span></article><article><b>{stats.published}</b><span>Published</span></article><article><b>{stats.team}</b><span>Board members</span></article><article><b>{stats.photos}</b><span>Photos</span></article><article><b>{stats.videos}</b><span>Videos</span></article></div>
        <section className="cms-panel"><span className="admin-kicker">Quick actions</span><h2>What do you want to update?</h2><div className="quick-grid">{canManageEvents&&<button onClick={()=>{setContent({...content,events:[blankEvent(),...content.events]});setTab("Events")}}>＋ Add event<span>Create a new event</span></button>}{canManageTeam&&<button onClick={()=>{setContent({...content,team:[...content.team,blankMember()]});setTab("Team")}}>＋ Add board member<span>Update the public team</span></button>}{canManageGallery&&<button onClick={()=>{setContent({...content,gallery:[blankMedia("image"),...content.gallery]});setTab("Gallery")}}>＋ Add media<span>Photo, video or Drive link</span></button>}{canManageAll&&<button onClick={()=>setTab("Homepage")}>Edit homepage<span>Hero, videos and featured event</span></button>}{canManageAll&&<a className="quick-link" href="/admin/newsletter">Create newsletter ↗<span>Email the community</span></a>}{canManageAll&&<a className="quick-link" href="/admin/users">Manage access ↗<span>Roles and invitations</span></a>}</div></section>
      </>}

      {tab==="Homepage"&&canManageAll&&<div className="editor-list"><section className="cms-panel form-stack"><span className="admin-kicker">Hero</span><h2>Homepage intro</h2><label>Headline<textarea value={content.homepage.headline} onChange={e=>setContent({...content,homepage:{...content.homepage,headline:e.target.value}})}/></label><label>Description<textarea value={content.homepage.description} onChange={e=>setContent({...content,homepage:{...content.homepage,description:e.target.value}})}/></label><label>Hero image URL<input value={content.homepage.heroImage} onChange={e=>setContent({...content,homepage:{...content.homepage,heroImage:e.target.value}})}/></label><label className="upload-field">Upload hero image<input type="file" accept="image/*" onChange={e=>upload(e,url=>setContent({...content,homepage:{...content.homepage,heroImage:url}}))}/></label><label>Featured event<select value={content.homepage.featuredEventId} onChange={e=>setContent({...content,homepage:{...content.homepage,featuredEventId:e.target.value}})}><option value="">No featured event</option>{content.events.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>{content.homepage.heroImage&&<img className="cms-preview" src={content.homepage.heroImage} alt="Hero preview"/>}</section><section className="cms-panel form-stack"><span className="admin-kicker">Video</span><h2>Homepage video slots</h2><label>Main video URL<input value={content.homepage.videoUrl} onChange={e=>setContent({...content,homepage:{...content.homepage,videoUrl:e.target.value}})}/></label><label>Main poster URL<input value={content.homepage.videoPosterUrl} onChange={e=>setContent({...content,homepage:{...content.homepage,videoPosterUrl:e.target.value}})}/></label><label>Secondary video URL<input value={content.homepage.secondaryVideoUrl} onChange={e=>setContent({...content,homepage:{...content.homepage,secondaryVideoUrl:e.target.value}})}/></label><label>Secondary poster URL<input value={content.homepage.secondaryVideoPosterUrl} onChange={e=>setContent({...content,homepage:{...content.homepage,secondaryVideoPosterUrl:e.target.value}})}/></label></section></div>}

      {tab==="Events"&&canManageEvents&&<div className="editor-list"><button className="admin-primary add-button" onClick={()=>setContent({...content,events:[blankEvent(),...content.events]})}>＋ Add event</button>{content.events.map((item,index)=><article className="cms-panel editor-card" key={item.id}><div className="editor-card-head"><div><span className="status-pill">{item.status}</span><h2>{item.title||"Untitled event"}</h2></div><button className="danger" onClick={()=>setContent({...content,events:content.events.filter((_,i)=>i!==index)})}>Delete</button></div><div className="field-grid"><label>Title<input value={item.title} onChange={e=>patchEvent(index,{title:e.target.value})}/></label><label>Status<select value={item.status} onChange={e=>patchEvent(index,{status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option><option value="past">Past</option></select></label><label>Date<input type="date" value={item.date} onChange={e=>patchEvent(index,{date:e.target.value})}/></label><label>Time<input type="time" value={item.time} onChange={e=>patchEvent(index,{time:e.target.value})}/></label><label>Location<input value={item.location} onChange={e=>patchEvent(index,{location:e.target.value})}/></label><label>RSVP URL<input value={item.rsvpUrl} onChange={e=>patchEvent(index,{rsvpUrl:e.target.value})}/></label></div><label>Description<textarea value={item.description} onChange={e=>patchEvent(index,{description:e.target.value})}/></label><label>Image URL<input value={item.image} onChange={e=>patchEvent(index,{image:e.target.value})}/></label><label className="upload-field">Upload event image<input type="file" accept="image/*" onChange={e=>upload(e,url=>patchEvent(index,{image:url}))}/></label></article>)}</div>}

      {tab==="Team"&&canManageTeam&&<div className="editor-list"><button className="admin-primary add-button" onClick={()=>setContent({...content,team:[...content.team,blankMember()]})}>＋ Add board member</button>{content.team.map((item,index)=><article className="cms-panel team-editor" key={item.id}>{item.image?<img src={item.image} alt=""/>:<div className="member-placeholder">Photo</div>}<div className="form-stack"><div className="field-grid"><label>Name<input value={item.name} onChange={e=>patchTeam(index,{name:e.target.value})}/></label><label>Role<input value={item.role} onChange={e=>patchTeam(index,{role:e.target.value})}/></label><label>Email<input type="email" value={item.email} onChange={e=>patchTeam(index,{email:e.target.value})}/></label><label>Image URL<input value={item.image} onChange={e=>patchTeam(index,{image:e.target.value})}/></label></div><label className="upload-field">Upload portrait<input type="file" accept="image/*" onChange={e=>upload(e,url=>patchTeam(index,{image:url}))}/></label><button className="danger inline" onClick={()=>setContent({...content,team:content.team.filter((_,i)=>i!==index)})}>Remove member</button></div></article>)}</div>}

      {tab==="Gallery"&&canManageGallery&&<div className="editor-list"><section className="cms-panel gallery-guide"><div><span className="admin-kicker">Media library</span><h2>Photos, videos & Google Drive</h2><p>Upload a photo normally, or paste a public Google Drive share link. For Drive files, set sharing to <b>Anyone with the link → Viewer</b>.</p></div><div className="gallery-add-actions"><button className="admin-primary" onClick={()=>setContent({...content,gallery:[blankMedia("image"),...content.gallery]})}>＋ Add image</button><button onClick={()=>setContent({...content,gallery:[blankMedia("video"),...content.gallery]})}>＋ Add video</button></div></section>{content.gallery.map((item,index)=>{const video=item.mediaType==="video";const preview=video?galleryVideoEmbedUrl(item.image):galleryImageUrl(item.image);return <article className="cms-panel gallery-media-editor" key={item.id}><div className="gallery-media-preview">{item.image?(video?(isGoogleDriveUrl(item.image)?<iframe src={preview} title={item.title} allow="autoplay; fullscreen"/>:<video src={preview} controls playsInline/>):<img src={preview} alt=""/>):<div className="media-empty">{video?"Video preview":"Image preview"}</div>}</div><div className="form-stack"><div className="editor-card-head"><div><span className="status-pill">{video?"video":"image"}</span><h2>{item.title||"Untitled media"}</h2></div><button className="danger" onClick={()=>setContent({...content,gallery:content.gallery.filter((_,i)=>i!==index)})}>Remove</button></div><div className="field-grid"><label>Media type<select value={item.mediaType||"image"} onChange={e=>patchGallery(index,{mediaType:e.target.value as "image"|"video"})}><option value="image">Image</option><option value="video">Video</option></select></label><label>Title<input value={item.title} onChange={e=>patchGallery(index,{title:e.target.value})}/></label></div><label>Google Drive share link or direct media URL<input value={item.image} onChange={e=>patchGallery(index,{image:e.target.value})} placeholder="https://drive.google.com/file/d/.../view"/></label>{!video&&<label className="upload-field">Or upload image<input type="file" accept="image/*" onChange={e=>upload(e,url=>patchGallery(index,{image:url,mediaType:"image"}))}/></label>}<label>Caption<textarea value={item.description} onChange={e=>patchGallery(index,{description:e.target.value})}/></label><label>Original/source URL (optional)<input value={item.sourceUrl||""} onChange={e=>patchGallery(index,{sourceUrl:e.target.value})}/></label></div></article>})}</div>}

      {tab==="Settings"&&canManageAll&&<section className="cms-panel form-stack"><span className="admin-kicker">Club settings</span><h2>Public contact information</h2><div className="field-grid"><label>Club name<input value={content.settings.clubName} onChange={e=>setContent({...content,settings:{...content.settings,clubName:e.target.value}})}/></label><label>Short name<input value={content.settings.shortName} onChange={e=>setContent({...content,settings:{...content.settings,shortName:e.target.value}})}/></label><label>Email<input value={content.settings.email} onChange={e=>setContent({...content,settings:{...content.settings,email:e.target.value}})}/></label><label>Instagram<input value={content.settings.instagram} onChange={e=>setContent({...content,settings:{...content.settings,instagram:e.target.value}})}/></label><label>LinkedIn<input value={content.settings.linkedin} onChange={e=>setContent({...content,settings:{...content.settings,linkedin:e.target.value}})}/></label></div></section>}
    </section>
  </main>;
}
