"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get("error") === "not-authorized" ? "This account does not have board access." : "");
  const [loading, setLoading] = useState(false);

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
      redirectTo: `${window.location.origin}/admin/activate`,
    });
    setLoading(false);
    setError(resetError ? resetError.message : "Password reset email sent. Check your inbox.");
  }

  return <main className="admin-login-page">
    <section className="admin-login-card">
      <img src="/nyu-peruvian-logo.webp" alt="NYU Peruvian Student Association logo" className="admin-login-logo" />
      <span className="admin-kicker">Board portal</span>
      <h1>¡Viva Perú! Admin</h1>
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
