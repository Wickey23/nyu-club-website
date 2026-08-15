"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
const SITE_ORIGIN="https://nyuperu.org";
const RESET_COOLDOWN_MS=60_000;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUntil,setResetUntil]=useState(0);
  const [now,setNow]=useState(Date.now());
  const resetSeconds=Math.max(0,Math.ceil((resetUntil-now)/1000));

  useEffect(()=>{
    const code=new URL(window.location.href).searchParams.get("error");
    if(code==="not-authorized") setError("This account does not have board access.");
    if(code==="auth-callback") setError("The sign-in link could not be verified. Try again or request a new invitation.");
  },[]);
  useEffect(()=>{if(!resetUntil)return;const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[resetUntil]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) return setError(signInError.message);
    router.push("/admin");
    router.refresh();
  }

  async function resetPassword() {
    if (!email.trim()) return setError("Enter your email first.");
    if(resetSeconds>0)return setError(`A reset request was already sent. Wait ${resetSeconds} seconds before requesting another one.`);
    setLoading(true); setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${SITE_ORIGIN}/admin/reset-password`,
    });
    setLoading(false);
    setResetUntil(Date.now()+RESET_COOLDOWN_MS);setNow(Date.now());
    if(resetError){
      const text=resetError.message||"Unable to send password reset email.";
      if(/rate limit|too many/i.test(text))return setError("Too many password-reset emails were requested recently. Wait at least a minute before trying again, or ask a Super Admin to send a reset from Users & Access.");
      return setError(text);
    }
    setError("Password reset email sent. Open the newest email to choose a new password. Please do not press Forgot password again while the countdown is active.");
  }

  return <main className="admin-login-page">
    <section className="admin-login-card">
      <img src="/nyu-peruvian-logo-v4.svg" alt="NYU Peruvian Student Association logo" className="admin-login-logo" />
      <span className="admin-kicker">Board portal</span>
      <h1>Admin sign in</h1>
      <p>Sign in with the email address that was approved by a club administrator.</p>
      <form onSubmit={submit} className="admin-login-form">
        <label>Email address<input type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@nyu.edu" required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></label>
        {error && <div className="admin-error">{error}</div>}
        <button className="admin-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
        <button type="button" onClick={resetPassword} disabled={loading||resetSeconds>0} className="admin-link-button">{resetSeconds>0?`Forgot password? (${resetSeconds}s)`:"Forgot password?"}</button>
      </form>
      <p className="admin-login-note">New board member? Use the invitation email sent by the Super Admin to activate your account.</p>
      <a href="/" className="admin-back">← Back to website</a>
    </section>
  </main>;
}
