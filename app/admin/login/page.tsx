"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setError(data.error || "Unable to sign in.");
    router.push("/admin"); router.refresh();
  }

  return <main className="admin-login-page">
    <section className="admin-login-card">
      <img src="/nyu-peruvian-logo.webp" alt="NYU Peruvian Student Association logo" className="admin-login-logo" />
      <span className="admin-kicker">Board portal</span>
      <h1>¡Viva Perú! Admin</h1>
      <p>Restricted to approved NYU Peruvian Student Association board members.</p>
      <form onSubmit={submit} className="admin-login-form">
        <label>Board email<input type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@nyu.edu" required /></label>
        <label>Club admin password<input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></label>
        {error && <div className="admin-error">{error}</div>}
        <button className="admin-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
      </form>
      <a href="/" className="admin-back">← Back to website</a>
    </section>
  </main>;
}
