"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

const SITE_ORIGIN="https://nyuperu.org";
type ActivationState="checking"|"ready"|"recovery"|"success";

export default function AdminActivatePage() {
  const [state,setState]=useState<ActivationState>("checking");
  const [accountEmail,setAccountEmail]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [recoveryEmail,setRecoveryEmail]=useState("");
  const [message,setMessage]=useState("Checking your secure invitation…");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    const supabase=createSupabaseBrowserClient();
    (async()=>{
      try{
        const search=new URLSearchParams(window.location.search);
        const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
        const code=search.get("code");
        const tokenHash=search.get("token_hash");
        const queryType=search.get("type");
        const hashType=hash.get("type");
        const accessToken=hash.get("access_token");
        const refreshToken=hash.get("refresh_token");

        if(code){
          const{error}=await supabase.auth.exchangeCodeForSession(code);
          if(error)throw error;
        }else if(tokenHash&&["invite","magiclink","email","signup"].includes(queryType||"")){
          const{error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type:queryType as "invite"|"magiclink"|"email"|"signup"});
          if(error)throw error;
        }else if(accessToken&&refreshToken&&(hashType==="invite"||!hashType)){
          const{error}=await supabase.auth.setSession({access_token:accessToken,refresh_token:refreshToken});
          if(error)throw error;
        }

        const{data:{session},error}=await supabase.auth.getSession();
        if(error)throw error;
        if(!session){
          setState("recovery");
          setMessage("This invitation is expired, already used, or did not retain its secure session. Request a fresh password setup link below.");
          return;
        }

        const email=session.user.email||"";
        setAccountEmail(email);
        setRecoveryEmail(email);
        window.history.replaceState({},document.title,"/admin/activate");
        setState("ready");
        setMessage("Invitation verified. Create a password to finish setting up your board account.");
      }catch(error){
        console.error("Activation error",error);
        setState("recovery");
        setMessage("This invitation is expired or has already been used. Request a fresh password setup link below.");
      }
    })();
  },[]);

  async function sendRecovery(event:FormEvent){
    event.preventDefault();
    const email=recoveryEmail.trim();
    if(!email)return setMessage("Enter the email address that received the board invitation.");
    setLoading(true);
    setMessage("Sending a secure setup link…");
    const supabase=createSupabaseBrowserClient();
    const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${SITE_ORIGIN}/admin/reset-password`});
    setLoading(false);
    if(error){
      if(error.message.toLowerCase().includes("rate"))return setMessage("Too many setup emails were requested recently. Wait about a minute, then try again.");
      return setMessage(error.message);
    }
    setMessage("Password setup email sent. Open the newest email and follow the link to finish creating your account.");
  }

  async function submit(event:FormEvent){
    event.preventDefault();
    if(password.length<8)return setMessage("Use a password with at least 8 characters.");
    if(password!==confirm)return setMessage("The passwords do not match.");

    setLoading(true);
    const supabase=createSupabaseBrowserClient();
    const{data:{user},error:userError}=await supabase.auth.getUser();
    if(userError||!user){
      setLoading(false);
      setState("recovery");
      return setMessage("Your secure invitation session expired. Request a fresh password setup link below.");
    }

    const{error}=await supabase.auth.updateUser({password});
    if(error){setLoading(false);return setMessage(error.message);}

    const{error:activateError}=await supabase.rpc("activate_own_board_profile");
    if(activateError){setLoading(false);return setMessage(activateError.message);}

    const{data:refreshed,error:refreshError}=await supabase.auth.refreshSession();
    if(refreshError||!refreshed.session){
      setLoading(false);
      return setMessage("Your account was activated, but the sign-in session could not be refreshed. Please sign in with the password you just created.");
    }

    setState("success");
    setMessage("Account activated. Opening your admin dashboard…");
    window.location.replace("/admin");
  }

  return <main className="admin-login-page">
    <section className="admin-login-card">
      <img src="/nyu-peruvian-logo-v4.svg" alt="NYU Peruvian Student Association logo" className="admin-login-logo"/>
      <span className="admin-kicker">Board account</span>
      <h1>{state==="success"?"Account activated":"Activate your account"}</h1>
      <p>{message}</p>

      {state==="checking"&&<div className="cms-notice">Verifying invitation…</div>}

      {state==="ready"&&<>
        {accountEmail&&<div className="cms-notice"><b>Account</b><br/>{accountEmail}</div>}
        <form onSubmit={submit} className="admin-login-form">
          <label>New password<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/></label>
          <label>Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8}/></label>
          <button className="admin-primary" disabled={loading}>{loading?"Activating…":"Activate account"}</button>
        </form>
      </>}

      {state==="recovery"&&<form onSubmit={sendRecovery} className="admin-login-form">
        <label>Invited email address<input type="email" autoComplete="email" value={recoveryEmail} onChange={e=>setRecoveryEmail(e.target.value)} placeholder="name@nyu.edu" required/></label>
        <button className="admin-primary" disabled={loading}>{loading?"Sending…":"Send new setup link"}</button>
      </form>}

      <a href="/admin/login" className="admin-back">← Back to sign in</a>
      <a href="/" className="admin-back">Back to nyuperu.org</a>
    </section>
  </main>;
}
