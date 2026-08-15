"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function AdminResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("Verifying your password reset link…");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    (async () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const code = search.get("code");
        const tokenHash = search.get("token_hash");
        const queryType = search.get("type");
        const hashType = hash.get("type");
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && queryType === "recovery") {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          if (error) throw error;
        } else if (accessToken && refreshToken && (hashType === "recovery" || !hashType)) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error("No active recovery session");

        window.history.replaceState({}, document.title, "/admin/reset-password");
        setReady(true);
        setMessage("Choose a new password for your board account.");
      } catch (error) {
        console.error("Password recovery error", error);
        setReady(false);
        setMessage("This password reset link is invalid, expired, or has already been used. Request a new one from the sign-in page.");
      }
    })();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setMessage("Use a password with at least 8 characters.");
    if (password !== confirm) return setMessage("The passwords do not match.");

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setLoading(false); return setMessage(error.message); }

    const { error: activateError } = await supabase.rpc("activate_own_board_profile");
    if (activateError) { setLoading(false); return setMessage(activateError.message); }

    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session) {
      setLoading(false);
      return setMessage("Your password was updated, but the sign-in session could not be refreshed. Please sign in with your new password.");
    }

    setMessage("Account ready. Opening your admin dashboard…");
    window.location.replace("/admin");
  }

  return <main className="admin-login-page">
    <section className="admin-login-card">
      <img src="/nyu-peruvian-logo-v4.svg" alt="NYU Peruvian Student Association logo" className="admin-login-logo" />
      <span className="admin-kicker">Password setup</span>
      <h1>Set your board password</h1>
      <p>{message}</p>

      {ready && <form onSubmit={submit} className="admin-login-form">
        <label>New password<input type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8}/></label>
        <label>Confirm new password<input type="password" autoComplete="new-password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required minLength={8}/></label>
        <button className="admin-primary" disabled={loading}>{loading ? "Activating…" : "Create / update account"}</button>
      </form>}

      {!ready && <a href="/admin/login" className="admin-primary" style={{display:"inline-block",textDecoration:"none",marginTop:8}}>Request a new setup link</a>}
      <a href="/admin/login" className="admin-back">← Back to sign in</a>
    </section>
  </main>;
}
