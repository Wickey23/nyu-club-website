"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export default function AdminActivatePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("Checking your invitation…");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
        setMessage("Create a password for your board account.");
      } else {
        setMessage("Open this page from the invitation or password-reset email so your secure session can be verified.");
      }
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setMessage("Use a password with at least 8 characters.");
    if (password !== confirm) return setMessage("The passwords do not match.");
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return setMessage("Your invitation session has expired. Ask the Super Admin to resend the invitation.");
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      return setMessage(error.message);
    }
    await supabase.from("profiles").update({ status: "active" }).eq("id", user.id);
    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return <main className="admin-login-page">
    <section className="admin-login-card">
      <img src="/nyu-peruvian-logo.webp" alt="NYU Peruvian Student Association logo" className="admin-login-logo" />
      <span className="admin-kicker">Board invitation</span>
      <h1>Activate your account</h1>
      <p>{message}</p>
      {ready && <form onSubmit={submit} className="admin-login-form">
        <label>New password<input type="password" autoComplete="new-password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8}/></label>
        <label>Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required minLength={8}/></label>
        <button className="admin-primary" disabled={loading}>{loading ? "Activating…" : "Activate account"}</button>
      </form>}
      <a href="/admin/login" className="admin-back">← Back to sign in</a>
    </section>
  </main>;
}
