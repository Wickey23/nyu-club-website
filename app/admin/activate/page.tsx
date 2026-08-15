"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

const SITE_ORIGIN="https://nyuperu.org";
type ActivationState="checking"|"ready"|"recovery"|"success";
const academicYear=(start:number)=>`${start}–${start+1}`;
const currentAcademicStart=()=>{const d=new Date();const y=d.getFullYear();return d.getMonth()>=6?y:y-1};

export default function AdminActivatePage() {
  const [state,setState]=useState<ActivationState>("checking");
  const [accountEmail,setAccountEmail]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [teamTitle,setTeamTitle]=useState("");
  const [boardYear,setBoardYear]=useState(academicYear(currentAcademicStart()));
  const [bio,setBio]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [profileOnly,setProfileOnly]=useState(false);
  const [recoveryEmail,setRecoveryEmail]=useState("");
  const [message,setMessage]=useState("Checking your secure invitation…");
  const [loading,setLoading]=useState(false);
  const boardYears=useMemo(()=>Array.from({length:Math.max(1,currentAcademicStart()-2016+1)},(_,i)=>academicYear(currentAcademicStart()-i)),[]);

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
        const completingProfile=search.get("flow")==="profile";
        setProfileOnly(completingProfile);

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
        const {data:profile}=await supabase.from("profiles").select("display_name,status").eq("id",session.user.id).maybeSingle();
        setDisplayName(profile?.display_name||String(session.user.user_metadata?.display_name||""));
        window.history.replaceState({},document.title,completingProfile?"/admin/activate?flow=profile":"/admin/activate");
        setState("ready");
        setMessage(completingProfile?"Finish your board profile to complete account setup.":"Invitation verified. Create your password and board profile to finish setting up your account.");
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
    if(displayName.trim().length<2)return setMessage("Enter your full name.");
    if(teamTitle.trim().length<2)return setMessage("Enter your board position.");
    if(!boardYear)return setMessage("Select your board year.");
    if(!profileOnly&&password.length<8)return setMessage("Use a password with at least 8 characters.");
    if(!profileOnly&&password!==confirm)return setMessage("The passwords do not match.");

    setLoading(true);
    const supabase=createSupabaseBrowserClient();
    const{data:{user},error:userError}=await supabase.auth.getUser();
    if(userError||!user){
      setLoading(false);
      setState("recovery");
      return setMessage("Your secure invitation session expired. Request a fresh password setup link below.");
    }

    if(!profileOnly){
      const{error}=await supabase.auth.updateUser({password});
      if(error&&String((error as any).code||"")!=="same_password"&&!/different from the old password/i.test(error.message)){
        setLoading(false);return setMessage(error.message);
      }
    }

    const{error:completeError}=await supabase.rpc("complete_own_board_account",{
      p_display_name:displayName.trim(),
      p_team_title:teamTitle.trim(),
      p_board_year:boardYear,
      p_bio:bio.trim(),
    });
    if(completeError){setLoading(false);return setMessage(completeError.message);}

    const{data:refreshed,error:refreshError}=await supabase.auth.refreshSession();
    if(refreshError||!refreshed.session){
      setLoading(false);
      return setMessage("Your account was activated, but the sign-in session could not be refreshed. Please sign in with the password you just created.");
    }

    setState("success");
    setMessage("Account activated and Team profile created. Opening your board portal…");
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
          <label>Full name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} autoComplete="name" placeholder="Your full name" required/></label>
          <label>Board position<input value={teamTitle} onChange={e=>setTeamTitle(e.target.value)} placeholder="e.g. Director of Marketing" required/></label>
          <label>Board year<select value={boardYear} onChange={e=>setBoardYear(e.target.value)} required>{boardYears.map(year=><option key={year} value={year}>{year}</option>)}</select></label>
          <label>Short bio <small>optional</small><textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="A short introduction for the Team page." rows={3}/></label>
          {!profileOnly&&<><label>New password<input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/></label>
          <label>Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8}/></label></>}
          <button className="admin-primary" disabled={loading}>{loading?"Activating…":profileOnly?"Complete account":"Activate account"}</button>
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
