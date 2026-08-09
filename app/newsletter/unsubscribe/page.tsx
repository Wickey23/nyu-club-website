"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function UnsubscribePage(){
  const [message,setMessage]=useState("Updating your subscription…");

  useEffect(()=>{
    const token=new URL(window.location.href).searchParams.get("token");
    if(!token){ setMessage("This unsubscribe link is missing its token."); return; }
    const supabase=createSupabaseBrowserClient();
    supabase.rpc("unsubscribe_newsletter",{p_token:token}).then(({error})=>{
      setMessage(error?"We could not update your subscription. Please contact peru@nyu.edu.":"You’ve been unsubscribed from the ¡Viva Perú! newsletter.");
    });
  },[]);

  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#f5ede2"}}>
    <section style={{width:"min(560px,100%)",background:"white",borderRadius:18,padding:"36px",boxShadow:"0 20px 60px rgba(0,0,0,.1)",textAlign:"center"}}>
      <img src="/nyu-peruvian-logo.webp" alt="NYU Peruvian Student Association" style={{width:96,height:96,objectFit:"contain"}}/>
      <span className="kicker" style={{display:"block",marginTop:18}}>Newsletter preferences</span>
      <h1 style={{fontFamily:"var(--font-display)",fontSize:"2.5rem",margin:"8px 0 14px"}}>Subscription updated</h1>
      <p style={{lineHeight:1.65}}>{message}</p>
      <Link href="/" className="btn red" style={{display:"inline-block",marginTop:12}}>Return to ¡Viva Perú!</Link>
    </section>
  </main>;
}
