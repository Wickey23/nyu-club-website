"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

type Subscriber={id:string;email:string;name:string;status:"subscribed"|"unsubscribed";signup_source:string;consent_at:string};
type Campaign={id:string;subject:string;preview_text:string;html_content:string;status:"draft"|"scheduled"|"sending"|"sent"|"failed";created_at:string;sent_at:string|null};

export default function NewsletterAdmin(){
  const [subscribers,setSubscribers]=useState<Subscriber[]>([]);
  const [campaigns,setCampaigns]=useState<Campaign[]>([]);
  const [subject,setSubject]=useState("");
  const [preview,setPreview]=useState("");
  const [html,setHtml]=useState("<h1>¡Viva Perú!</h1><p>Write your newsletter here.</p>");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function load(){
    const supabase=createSupabaseBrowserClient();
    const [{data:subs,error:subError},{data:camps,error:campError}]=await Promise.all([
      supabase.from("newsletter_subscribers").select("id,email,name,status,signup_source,consent_at").order("consent_at",{ascending:false}),
      supabase.from("newsletter_campaigns").select("id,subject,preview_text,html_content,status,created_at,sent_at").order("created_at",{ascending:false}),
    ]);
    if(subError||campError) return setMessage(subError?.message||campError?.message||"Unable to load newsletter data.");
    setSubscribers((subs||[]) as Subscriber[]); setCampaigns((camps||[]) as Campaign[]);
  }
  useEffect(()=>{load()},[]);

  async function createCampaign(event:FormEvent){
    event.preventDefault(); if(!subject.trim()) return setMessage("Add a subject first.");
    setLoading(true); setMessage("Saving draft…");
    const supabase=createSupabaseBrowserClient();
    const {data,error}=await supabase.from("newsletter_campaigns").insert({subject:subject.trim(),preview_text:preview.trim(),html_content:html,status:"draft"}).select().single();
    setLoading(false);
    if(error) return setMessage(error.message);
    setMessage("Draft saved."); setSubject(""); setPreview(""); setHtml("<h1>¡Viva Perú!</h1><p>Write your newsletter here.</p>"); await load();
    if(data) console.log("Created campaign",data.id);
  }

  async function sendCampaign(campaign:Campaign){
    if(!confirm(`Send “${campaign.subject}” to all active subscribers?`)) return;
    setLoading(true); setMessage("Sending newsletter…");
    const supabase=createSupabaseBrowserClient();
    const {data,error}=await supabase.functions.invoke("send-newsletter",{body:{campaignId:campaign.id,siteOrigin:window.location.origin}});
    setLoading(false);
    if(error||data?.error) return setMessage(data?.error||error?.message||"Send failed.");
    setMessage(`Sent ${data.sent} email${data.sent===1?"":"s"}${data.failed?`; ${data.failed} failed`:""}.`); await load();
  }

  async function setSubscriberStatus(subscriber:Subscriber,status:"subscribed"|"unsubscribed"){
    const supabase=createSupabaseBrowserClient();
    const {error}=await supabase.from("newsletter_subscribers").update({status,unsubscribed_at:status==="unsubscribed"?new Date().toISOString():null}).eq("id",subscriber.id);
    if(error) return setMessage(error.message); await load();
  }

  const active=subscribers.filter(s=>s.status==="subscribed").length;
  return <main style={{minHeight:"100vh",background:"#f4ede4",padding:"34px 20px 70px",fontFamily:"var(--font-sans)"}}>
    <div style={{maxWidth:1180,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",marginBottom:26,flexWrap:"wrap"}}>
        <div><span className="admin-kicker">Communications</span><h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2.2rem,5vw,4rem)",margin:"4px 0"}}>Newsletter</h1><p style={{margin:0,opacity:.72}}>Manage subscribers and send club updates from one place.</p></div>
        <a href="/admin" className="admin-primary" style={{textDecoration:"none"}}>← Board CMS</a>
      </div>
      {message&&<div className="cms-notice" style={{marginBottom:18}}>{message}</div>}

      <div className="cms-stats" style={{marginBottom:24}}><article><b>{active}</b><span>Active subscribers</span></article><article><b>{subscribers.length-active}</b><span>Unsubscribed</span></article><article><b>{campaigns.length}</b><span>Campaigns</span></article><article><b>{campaigns.filter(c=>c.status==="sent").length}</b><span>Sent</span></article></div>

      <section className="cms-panel" style={{marginBottom:24}}>
        <span className="admin-kicker">New campaign</span><h2 style={{marginTop:6}}>Create newsletter</h2>
        <form onSubmit={createCampaign} className="form-stack">
          <label>Subject<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="September with ¡Viva Perú!" required/></label>
          <label>Preview text<input value={preview} onChange={e=>setPreview(e.target.value)} placeholder="Events, community news and what’s next."/></label>
          <label>Email HTML<textarea value={html} onChange={e=>setHtml(e.target.value)} rows={12}/></label>
          <div dangerouslySetInnerHTML={{__html:html}} style={{background:"white",border:"1px solid rgba(0,0,0,.1)",borderRadius:10,padding:24}}/>
          <button className="admin-primary" disabled={loading}>{loading?"Saving…":"Save draft"}</button>
        </form>
      </section>

      <section className="cms-panel" style={{marginBottom:24}}>
        <div className="cms-panel-head"><div><span className="admin-kicker">Campaigns</span><h2>Newsletter history</h2></div></div>
        <div style={{display:"grid",gap:10}}>{campaigns.map(c=><article key={c.id} style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",padding:"14px 0",borderTop:"1px solid rgba(0,0,0,.09)",flexWrap:"wrap"}}><div><b>{c.subject}</b><div style={{fontSize:13,opacity:.6}}>{c.status} · {new Date(c.created_at).toLocaleDateString()}</div></div><button className="admin-primary" disabled={loading||c.status==="sending"} onClick={()=>sendCampaign(c)}>{c.status==="sent"?"Send again":"Send now"}</button></article>)}</div>
        {!campaigns.length&&<p className="empty-state">No newsletters yet.</p>}
      </section>

      <section className="cms-panel">
        <div className="cms-panel-head"><div><span className="admin-kicker">Audience</span><h2>Subscribers</h2></div><b>{active} active</b></div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}><thead><tr><th style={{textAlign:"left",padding:"10px 8px"}}>Subscriber</th><th style={{textAlign:"left",padding:"10px 8px"}}>Source</th><th style={{textAlign:"left",padding:"10px 8px"}}>Joined</th><th style={{textAlign:"left",padding:"10px 8px"}}>Status</th></tr></thead><tbody>{subscribers.map(s=><tr key={s.id} style={{borderTop:"1px solid rgba(0,0,0,.08)"}}><td style={{padding:"12px 8px"}}><b>{s.name||"—"}</b><br/><span style={{fontSize:13,opacity:.68}}>{s.email}</span></td><td style={{padding:"12px 8px"}}>{s.signup_source}</td><td style={{padding:"12px 8px"}}>{new Date(s.consent_at).toLocaleDateString()}</td><td style={{padding:"12px 8px"}}><select value={s.status} onChange={e=>setSubscriberStatus(s,e.target.value as Subscriber["status"])}><option value="subscribed">Subscribed</option><option value="unsubscribed">Unsubscribed</option></select></td></tr>)}</tbody></table></div>
        {!subscribers.length&&<p className="empty-state">No newsletter subscribers yet.</p>}
      </section>
    </div>
  </main>;
}
