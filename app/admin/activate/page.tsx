"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
const SITE_ORIGIN="https://nyuperu.org";

export default function AdminActivatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [message, setMessage] = useState("Checking your invitation…");
  const [ready, setReady] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);
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
        if (code) { const { error } = await supabase.auth.exchangeCodeForSession(code); if (error) throw error; }
        else if (tokenHash && (queryType === "invite" || queryType === "magiclink" || queryType === "email" || queryType === "signup")) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: queryType as "invite" | "magiclink" | "email" | "signup" }); if (error) throw error;
        } else if (accessToken && refreshToken && (hashType === "invite" || !hashType)) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }); if (error) throw error;
        }
        const { data, error } = await supabase.auth.getSession(); if (error) throw error;
        if (data.session) { window.history.replaceState({}, document.title, "/admin/activate"); setReady(true); setNeedsRecovery(false); setMessage("Create a password for your board account."); }
        else { setNeedsRecovery(true); setMessage("Your invitation was accepted, but this browser did not retain the secure session. Send yourself a password setup link below."); }
      } catch (error) { console.error("Activation error", error); setNeedsRecovery(true); setMessage("This invitation session could not be completed in this browser. Send yourself a secure password setup link below."); }
    })();
  }, []);

  async function sendRecovery(event: FormEvent) {
    event.preventDefault(); if (!recoveryEmail.trim()) return; setLoading(true); setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), { redirectTo: `${SITE_ORIGIN}/admin/reset-password` });
    setLoading(false); if (error) return setMessage(error.message); setMessage("Password setup email sent. Open the newest email to choose your password.");
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); if (password.length < 8) return setMessage("Use a password with at least 8 characters."); if (password !== confirm) return setMessage("The passwords do not match.");
    setLoading(true); const supabase = createSupabaseBrowserClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); setNeedsRecovery(true); return setMessage("Your secure session has expired. Send yourself a new password setup link below."); }
    const { error } = await supabase.auth.updateUser({ password }); if (error) { setLoading(false); return setMessage(error.message); }
    const { error: activateError } = await supabase.rpc("activate_own_board_profile"); if (activateError) { setLoading(false); return setMessage(activateError.message); }
    setLoading(false); router.push("/admin"); router.refresh();
  }

  return <main className="admin-login-page"><section className="admin-login-card"><img src="/nyu-peruvian-logo-v4.svg" alt="NYU Peruvian Student Association logo" className="admin-login-logo" /><span className="admin-kicker">Board invitation</span><h1>Activate your account</h1><p>{message}</p>{ready && <form onSubmit={submit} className="admin-login-form"><label>New password<input type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8}/></label><label>Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required minLength={8}/></label><button className="admin-primary" disabled={loading}>{loading ? "Activating…" : "Activate account"}</button></form>}{!ready && needsRecovery && <form onSubmit={sendRecovery} className="admin-login-form"><label>Approved board email<input type="email" autoComplete="email" value={recoveryEmail} onChange={(e)=>setRecoveryEmail(e.target.value)} placeholder="name@nyu.edu" required /></label><button className="admin-primary" disabled={loading}>{loading ? "Sending…" : "Send password setup link"}</button></form>}<a href="/admin/login" className="admin-back">← Back to sign in</a></section></main>;
}
