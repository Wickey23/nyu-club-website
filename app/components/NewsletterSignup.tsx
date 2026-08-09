"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const dismissedKey = "viva-peru-newsletter-dismissed";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(dismissedKey)) return;
    const timer = window.setTimeout(() => setOpen(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  async function subscribe(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.rpc("subscribe_newsletter", {
      p_email: email.trim(),
      p_name: name.trim(),
      p_source: open ? "homepage-popup" : "homepage-inline",
    });
    setLoading(false);
    if (error) return setMessage(error.message || "Unable to subscribe right now.");
    setMessage("You’re on the list. Watch your inbox for ¡Viva Perú! updates.");
    setEmail("");
    setName("");
    window.localStorage.setItem(dismissedKey, "subscribed");
    window.setTimeout(() => setOpen(false), 1800);
  }

  function dismiss() {
    window.localStorage.setItem(dismissedKey, "dismissed");
    setOpen(false);
  }

  const form = <form onSubmit={subscribe} style={{display:"grid",gap:10}}>
    <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.4fr)",gap:10}}>
      <input aria-label="Name" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name (optional)" style={{minWidth:0,padding:"13px 14px",border:"1px solid rgba(0,0,0,.18)",borderRadius:8,font:"inherit"}} />
      <input aria-label="Email address" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@nyu.edu" style={{minWidth:0,padding:"13px 14px",border:"1px solid rgba(0,0,0,.18)",borderRadius:8,font:"inherit"}} />
    </div>
    <button disabled={loading} type="submit" style={{border:0,borderRadius:8,padding:"13px 18px",fontWeight:800,cursor:"pointer",background:"#c91525",color:"white"}}>{loading?"Joining…":"Join the newsletter"}</button>
    {message && <small style={{lineHeight:1.45}}>{message}</small>}
    <small style={{opacity:.65,lineHeight:1.45}}>Club news, event announcements and cultural programming. Unsubscribe anytime.</small>
  </form>;

  return <>
    <section style={{background:"#f5ede2",padding:"54px 20px"}}>
      <div style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(320px,.75fr)",gap:48,alignItems:"center"}}>
        <div><span className="kicker">Stay connected</span><h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2rem,4vw,3.5rem)",lineHeight:1,margin:"8px 0 14px"}}>Peru in your inbox.</h2><p style={{maxWidth:660,fontSize:"1.06rem",lineHeight:1.65,margin:0}}>Get upcoming events, collaborations, cultural programming and community updates from the NYU Peruvian Student Association.</p></div>
        <div style={{background:"white",padding:24,border:"1px solid rgba(0,0,0,.08)",borderRadius:16,boxShadow:"0 18px 50px rgba(0,0,0,.07)"}}>{form}</div>
      </div>
    </section>

    {open && <div role="dialog" aria-modal="true" aria-label="Join the ¡Viva Perú! newsletter" style={{position:"fixed",inset:0,zIndex:1000,display:"grid",placeItems:"end center",padding:20,pointerEvents:"none"}}>
      <section style={{pointerEvents:"auto",position:"relative",width:"min(560px,100%)",background:"#fffaf4",border:"1px solid rgba(0,0,0,.12)",borderRadius:18,padding:"28px",boxShadow:"0 24px 80px rgba(0,0,0,.25)"}}>
        <button onClick={dismiss} aria-label="Dismiss newsletter signup" style={{position:"absolute",right:14,top:12,border:0,background:"transparent",fontSize:24,cursor:"pointer"}}>×</button>
        <span className="kicker">¡Viva Perú! updates</span>
        <h2 style={{fontFamily:"var(--font-display)",fontSize:"2.2rem",lineHeight:1.05,margin:"8px 28px 10px 0"}}>Don’t miss what’s next.</h2>
        <p style={{lineHeight:1.6,margin:"0 0 18px"}}>Join the club newsletter for event announcements and community updates.</p>
        {form}
      </section>
    </div>}
  </>;
}
