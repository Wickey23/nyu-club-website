"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function UnsubscribePage(){
  const [message,setMessage]=useState("Updating your subscription…");
  const [brand,setBrand]=useState("NYU Perú");
  const [clubName,setClubName]=useState("NYU Peruvian Student Association");
  const [contact,setContact]=useState("peru@nyu.edu");

  useEffect(()=>{
    const supabase=createSupabaseBrowserClient();
    void supabase.from("site_settings").select("short_name,club_name,email").eq("id",1).single().then(({data})=>{
      if(data?.short_name?.trim()) setBrand(data.short_name.trim());
      if(data?.club_name?.trim()) setClubName(data.club_name.trim());
      if(data?.email?.trim()) setContact(data.email.trim());
    });

    const token=new URL(window.location.href).searchParams.get("token");
    if(!token){ setMessage("This unsubscribe link is missing its token."); return; }
    supabase.rpc("unsubscribe_newsletter",{p_token:token}).then(({error})=>{
      if(error) setMessage(`We could not update your subscription. Please contact ${contact}.`);
      else {
        setMessage("You’ve been unsubscribed from the newsletter.");
        void supabase.rpc("track_site_event",{p_event_type:"newsletter_unsubscribe",p_path:"/newsletter/unsubscribe",p_referrer:document.referrer||"",p_session_id:null,p_metadata:{}});
      }
    });
  },[contact]);

  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f5ede2"}}>
    <section style={{width:"min(560px,100%)",background:"white",borderRadius:18,padding:"36px",boxShadow:"0 20px 60px rgba(0,0,0,.1)",textAlign:"center"}}>
      <img src="/nyu-peruvian-logo-v4.svg" alt={`${clubName} logo`} style={{width:96,height:96,objectFit:"contain"}}/>
      <span className="kicker" style={{display:"block",marginTop:18}}>Newsletter preferences</span>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:"2.5rem",margin:"8px 0 14px"}}>Subscription updated</h1>
      <p style={{lineHeight:1.65}}>{message}</p>
      <Link href="/" className="btn red" style={{display:"inline-block",marginTop:12}}>Return to {brand}</Link>
    </section>
  </main>;
}
