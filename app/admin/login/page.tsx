"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const code=new URL(window.location.href).searchParams.get("error");
    if(code==="not-authorized") setError("This account does not have board access.");
    if(code==="auth-callback") setError("The sign-in link could not be verified. Try again or request a new invitation.");
  },[]);

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
    setLoading(true); setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setLoading(false);
    setError(resetError ? resetError.message : "Password reset email sent. Open the newest email to choose a new password.");
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
        <button type="button" onClick={resetPassword} disabled={loading} className="admin-link-button">Forgot password?</button>
      </form>
      <p className="admin-login-note">New board member? Use the invitation email sent by the Super Admin to activate your account.</p>
      <a href="/" className="admin-back">← Back to website</a>
    </section>
  </main>;
}
