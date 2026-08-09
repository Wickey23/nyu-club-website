"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { galleryImageUrl } from "../../lib/mediaUrl";
import { buildNewsletterHtml, formatEventDate, type NewsletterEvent, type NewsletterGalleryItem, type NewsletterSettings } from "./emailBuilder";

type Subscriber={id:string;email:string;name:string;status:"subscribed"|"unsubscribed";signup_source:string;consent_at:string};
type Campaign={id:string;subject:string;preview_text:string;html_content:string;status:"draft"|"scheduled"|"sending"|"sent"|"failed";created_at:string;sent_at:string|null};
type SiteContent={events:NewsletterEvent[];gallery:NewsletterGalleryItem[];settings:NewsletterSettings};
type TemplateKey="monthly"|"events"|"recap"|"announcement";

const templates:Record<TemplateKey,{label:string;description:string;subject:string;preview:string;heading:string;intro:string;closing:string}>={
  monthly:{label:"Monthly update",description:"Events + recent photos + general club update",subject:"What’s happening with our community",preview:"Upcoming events, recent moments and what’s next.",heading:"Here’s what’s happening.",intro:"A quick look at what’s coming up, what our community has been doing, and ways to stay connected.",closing:"We hope to see you at an upcoming event. Thank you for being part of our community."},
  events:{label:"Upcoming events",description:"A clean digest of the next events",subject:"Upcoming events you won’t want to miss",preview:"Save the dates and join us at our next events.",heading:"Save the dates.",intro:"Here are the next opportunities to connect, celebrate and experience Peruvian culture with us.",closing:"Bring a friend and come be part of it. We’ll see you there."},
  recap:{label:"Community recap",description:"Recent gallery highlights and community moments",subject:"A look back at recent moments",preview:"Photos and highlights from our recent community programming.",heading:"Recent moments together.",intro:"From conversations to culture, food and community, here are a few moments worth revisiting.",closing:"More is coming soon. Follow along and stay connected for the next gathering."},
  announcement:{label:"Big announcement",description:"One focused message with optional event/media blocks",subject:"An update from our club",preview:"Important news from our community.",heading:"We have something to share.",intro:"We’re excited to share an important update with our community.",closing:"Thank you for supporting the club and helping us continue building community at NYU."},
};

export default function NewsletterAdmin(){
  const [subscribers,setSubscribers]=useState<Subscriber[]>([]);
  const [campaigns,setCampaigns]=useState<Campaign[]>([]);
  const [site,setSite]=useState<SiteContent>({events:[],gallery:[],settings:{clubName:"NYU Peruvian Student Association",shortName:"NYU Perú",email:"peru@nyu.edu",instagram:"",linkedin:""}});
  const [template,setTemplate]=useState<TemplateKey>("monthly");
  const [subject,setSubject]=useState(templates.monthly.subject);
  const [preview,setPreview]=useState(templates.monthly.preview);
  const [heading,setHeading]=useState(templates.monthly.heading);
  const [intro,setIntro]=useState(templates.monthly.intro);
  const [closing,setClosing]=useState(templates.monthly.closing);
  const [ctaLabel,setCtaLabel]=useState("Visit the club website");
  const [selectedEvents,setSelectedEvents]=useState<string[]>([]);
  const [selectedGallery,setSelectedGallery]=useState<string[]>([]);
  const [galleryDays,setGalleryDays]=useState(30);
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  const [advanced,setAdvanced]=useState(false);
  const [htmlOverride,setHtmlOverride]=useState("");

  async function load(){
    const supabase=createSupabaseBrowserClient();
    const [{data:subs,error:subError},{data:camps,error:campError},contentResponse]=await Promise.all([
      supabase.from("newsletter_subscribers").select("id,email,name,status,signup_source,consent_at").order("consent_at",{ascending:false}),
      supabase.from("newsletter_campaigns").select("id,subject,preview_text,html_content,status,created_at,sent_at").order("created_at",{ascending:false}),
      fetch("/api/admin/content",{cache:"no-store"}),
    ]);
    const contentData=await contentResponse.json().catch(()=>({}));
    if(subError||campError||!contentResponse.ok){setMessage(subError?.message||campError?.message||contentData.error||"Unable to load newsletter data.");return;}
    setSubscribers((subs||[]) as Subscriber[]);
    setCampaigns((camps||[]) as Campaign[]);
    setSite(contentData.content as SiteContent);
  }
  useEffect(()=>{void load()},[]);

  const active=subscribers.filter(s=>s.status==="subscribed").length;
  const availableEvents=useMemo(()=>site.events.filter(e=>e.status==="published").sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")),[site.events]);
  const filteredGallery=useMemo(()=>{
    const cutoff=galleryDays===0?null:new Date(Date.now()-galleryDays*86400000);
    return site.gallery.filter(g=>g.mediaType!=="video"&&g.image&&(!cutoff||!g.createdAt||new Date(g.createdAt)>=cutoff));
  },[site.gallery,galleryDays]);
  const chosenEvents=availableEvents.filter(e=>selectedEvents.includes(e.id));
  const chosenGallery=filteredGallery.filter(g=>selectedGallery.includes(g.id));

  function futureEventIds(){
    const now=new Date();now.setHours(0,0,0,0);
    return availableEvents.filter(e=>!e.date||new Date(`${e.date}T12:00:00`)>=now).slice(0,4).map(e=>e.id);
  }
  function applyTemplate(key:TemplateKey){
    const t=templates[key];
    setTemplate(key);setSubject(t.subject);setPreview(t.preview);setHeading(t.heading);setIntro(t.intro);setClosing(t.closing);setAdvanced(false);setHtmlOverride("");
    if(key==="events")setSelectedEvents(futureEventIds());
    if(key==="recap")setSelectedGallery(filteredGallery.slice(0,6).map(g=>g.id));
  }
  function toggleEvent(id:string){setSelectedEvents(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);}
  function toggleGallery(id:string){setSelectedGallery(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);}

  const generated=buildNewsletterHtml({
    origin:typeof window!=="undefined"?window.location.origin:"",
    settings:site.settings,
    preview,heading,intro,closing,ctaLabel,
    events:chosenEvents,
    gallery:chosenGallery,
  });
  const html=advanced&&htmlOverride.trim()?htmlOverride:generated;

  async function createCampaign(event:FormEvent){
    event.preventDefault();if(!subject.trim()){setMessage("Add a subject first.");return;}
    setLoading(true);setMessage("Saving draft…");
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.from("newsletter_campaigns").insert({subject:subject.trim(),preview_text:preview.trim(),html_content:html,status:"draft"});
    setLoading(false);
    if(error){setMessage(error.message);return;}
    setMessage("Draft saved. Review it in Campaigns before sending.");
    await load();
  }

  async function sendCampaign(campaign:Campaign){
    if(!confirm(`Send “${campaign.subject}” to ${active} active subscriber${active===1?"":"s"}?`))return;
    setLoading(true);setMessage("Sending newsletter…");
    const supabase=createSupabaseBrowserClient();
    const {data,error}=await supabase.functions.invoke("send-newsletter",{body:{campaignId:campaign.id,siteOrigin:window.location.origin}});
    setLoading(false);
    if(error||data?.error){setMessage(data?.error||error?.message||"Send failed.");return;}
    setMessage(`Sent ${data.sent} email${data.sent===1?"":"s"}${data.failed?`; ${data.failed} failed`:""}.`);
    await load();
  }

  async function setSubscriberStatus(subscriber:Subscriber,status:"subscribed"|"unsubscribed"){
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.from("newsletter_subscribers").update({status,unsubscribed_at:status==="unsubscribed"?new Date().toISOString():null}).eq("id",subscriber.id);
    if(error){setMessage(error.message);return;}
    await load();
  }

  return <main style={{minHeight:"100vh",background:"#f4ede4",padding:"24px 14px 70px",fontFamily:"var(--font-sans)"}}>
    <div style={{maxWidth:1280,margin:"0 auto"}}>
      <header style={{display:"flex",justifyContent:"space-between",gap:18,alignItems:"center",marginBottom:24,flexWrap:"wrap"}}>
        <div><span className="admin-kicker">Communications studio</span><h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2.4rem,6vw,4.5rem)",margin:"4px 0"}}>Newsletter</h1><p style={{margin:0,opacity:.72,maxWidth:700}}>Build complete campaigns from your event calendar, recent gallery media and club updates—without writing HTML.</p></div>
        <a href="/admin" className="admin-primary" style={{textDecoration:"none"}}>← Board CMS</a>
      </header>
      {message&&<div className="cms-notice" style={{marginBottom:18}}>{message}</div>}

      <div className="cms-stats" style={{marginBottom:20}}><article><b>{active}</b><span>Active subscribers</span></article><article><b>{subscribers.length-active}</b><span>Unsubscribed</span></article><article><b>{campaigns.length}</b><span>Campaigns</span></article><article><b>{campaigns.filter(c=>c.status==="sent").length}</b><span>Sent</span></article></div>

      <section className="cms-panel"><span className="admin-kicker">1 · Start with a format</span><h2>Choose a newsletter type</h2><div className="quick-grid">{(Object.keys(templates) as TemplateKey[]).map(k=><button type="button" key={k} onClick={()=>applyTemplate(k)} style={{borderColor:template===k?"#c91525":undefined,background:template===k?"#fff7f7":undefined}}><b>{templates[k].label}</b><span>{templates[k].description}</span></button>)}</div></section>

      <form onSubmit={createCampaign}>
        <div className="newsletter-builder-grid" style={{display:"grid",gridTemplateColumns:"minmax(0,1.05fr) minmax(320px,.95fr)",gap:18,alignItems:"start"}}>
          <div>
            <section className="cms-panel form-stack"><span className="admin-kicker">2 · Message</span><h2>Write the core message</h2><label>Subject<input value={subject} onChange={e=>setSubject(e.target.value)} required/></label><label>Inbox preview text<input value={preview} onChange={e=>setPreview(e.target.value)}/></label><label>Email headline<input value={heading} onChange={e=>setHeading(e.target.value)}/></label><label>Introduction<textarea value={intro} onChange={e=>setIntro(e.target.value)}/></label><label>Closing note<textarea value={closing} onChange={e=>setClosing(e.target.value)}/></label><label>Bottom button text<input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)}/></label></section>

            <section className="cms-panel"><span className="admin-kicker">3 · Events</span><h2>Pull from your event calendar</h2><p>Select published events and the newsletter automatically inserts their date, location, description, image and RSVP link.</p><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}><button type="button" onClick={()=>setSelectedEvents(futureEventIds())}>Use next 4 events</button><button type="button" onClick={()=>setSelectedEvents([])}>Clear events</button></div><div style={{display:"grid",gap:9}}>{availableEvents.map(e=><label key={e.id} style={{display:"grid",gridTemplateColumns:"24px 1fr",gap:10,alignItems:"start",padding:12,border:"1px solid #e2ddd5",borderRadius:12,background:selectedEvents.includes(e.id)?"#fff7f7":"#fff"}}><input type="checkbox" checked={selectedEvents.includes(e.id)} onChange={()=>toggleEvent(e.id)}/><span><b>{e.title}</b><small style={{display:"block",marginTop:3,opacity:.65}}>{formatEventDate(e.date)}{e.location?` · ${e.location}`:""}</small></span></label>)}</div>{!availableEvents.length&&<p className="empty-state">No published events are available yet.</p>}</section>

            <section className="cms-panel"><span className="admin-kicker">4 · Gallery</span><h2>Add photos from a timeframe</h2><p>Choose a recent period, then select the images you want. This uses the actual date each gallery item was added.</p><div className="field-grid"><label>Gallery timeframe<select value={galleryDays} onChange={e=>{setGalleryDays(Number(e.target.value));setSelectedGallery([])}}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={0}>All gallery images</option></select></label><label>Quick select<select defaultValue="" onChange={e=>{const n=Number(e.target.value);if(n)setSelectedGallery(filteredGallery.slice(0,n).map(g=>g.id))}}><option value="">Choose…</option><option value="3">Use first 3</option><option value="6">Use first 6</option></select></label></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginTop:16}}>{filteredGallery.map(g=><button type="button" key={g.id} onClick={()=>toggleGallery(g.id)} style={{padding:6,border:selectedGallery.includes(g.id)?"3px solid #c91525":"1px solid #ddd",borderRadius:12,background:"white",textAlign:"left"}}><img src={galleryImageUrl(g.image)} alt="" style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:8,display:"block"}}/><span style={{display:"block",fontSize:11,fontWeight:700,padding:"7px 3px 3px"}}>{g.title||"Gallery image"}</span></button>)}</div>{!filteredGallery.length&&<p className="empty-state">No images match this timeframe.</p>}</section>

            <section className="cms-panel form-stack"><button type="button" onClick={()=>{setAdvanced(v=>!v);if(!htmlOverride)setHtmlOverride(generated)}}>{advanced?"Hide advanced HTML":"Advanced HTML override"}</button>{advanced&&<><p>Optional: edit the generated email HTML directly. If this field contains content, it becomes the saved email body.</p><textarea value={htmlOverride} onChange={e=>setHtmlOverride(e.target.value)} rows={18}/></>}<button className="admin-primary" type="submit" disabled={loading}>{loading?"Saving…":"Save campaign draft"}</button></section>
          </div>

          <aside className="newsletter-preview-sticky" style={{position:"sticky",top:18}}><section className="cms-panel"><span className="admin-kicker">Live email preview</span><h2>{subject||"Untitled newsletter"}</h2><p style={{fontSize:13,opacity:.65}}>{chosenEvents.length} event{chosenEvents.length===1?"":"s"} · {chosenGallery.length} photo{chosenGallery.length===1?"":"s"} · {active} active recipients</p><iframe title="Newsletter preview" srcDoc={html} style={{width:"100%",height:720,border:"1px solid #ddd",borderRadius:12,background:"white"}}/></section></aside>
        </div>
      </form>

      <section className="cms-panel" style={{marginTop:18}}><div className="cms-panel-head"><div><span className="admin-kicker">Campaigns</span><h2>Drafts & history</h2></div></div><div style={{display:"grid",gap:10}}>{campaigns.map(c=><article key={c.id} style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",padding:"14px 0",borderTop:"1px solid rgba(0,0,0,.09)",flexWrap:"wrap"}}><div><b>{c.subject}</b><div style={{fontSize:13,opacity:.6}}>{c.status} · {new Date(c.created_at).toLocaleDateString()}{c.sent_at?` · sent ${new Date(c.sent_at).toLocaleDateString()}`:""}</div></div><button className="admin-primary" disabled={loading||c.status==="sending"} onClick={()=>sendCampaign(c)}>{c.status==="sent"?"Send again":"Send now"}</button></article>)}</div>{!campaigns.length&&<p className="empty-state">No newsletters yet.</p>}</section>

      <section className="cms-panel"><div className="cms-panel-head"><div><span className="admin-kicker">Audience</span><h2>Subscribers</h2></div><b>{active} active</b></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}><thead><tr><th style={{textAlign:"left",padding:"10px 8px"}}>Subscriber</th><th style={{textAlign:"left",padding:"10px 8px"}}>Source</th><th style={{textAlign:"left",padding:"10px 8px"}}>Joined</th><th style={{textAlign:"left",padding:"10px 8px"}}>Status</th></tr></thead><tbody>{subscribers.map(s=><tr key={s.id} style={{borderTop:"1px solid rgba(0,0,0,.08)"}}><td style={{padding:"12px 8px"}}><b>{s.name||"—"}</b><br/><span style={{fontSize:13,opacity:.68}}>{s.email}</span></td><td style={{padding:"12px 8px"}}>{s.signup_source}</td><td style={{padding:"12px 8px"}}>{new Date(s.consent_at).toLocaleDateString()}</td><td style={{padding:"12px 8px"}}><select value={s.status} onChange={e=>setSubscriberStatus(s,e.target.value as Subscriber["status"])}><option value="subscribed">Subscribed</option><option value="unsubscribed">Unsubscribed</option></select></td></tr>)}</tbody></table></div>{!subscribers.length&&<p className="empty-state">No newsletter subscribers yet.</p>}</section>
    </div>
    <style>{`@media(max-width:900px){.newsletter-builder-grid{grid-template-columns:1fr!important}.newsletter-preview-sticky{position:static!important}}`}</style>
  </main>;
}
