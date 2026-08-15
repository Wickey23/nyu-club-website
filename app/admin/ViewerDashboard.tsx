"use client";

export default function ViewerDashboard({adminEmail}:{adminEmail:string}){
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});window.location.href="/admin/login"}
  return <main className="cms-shell">
    <aside className="cms-sidebar open">
      <div className="cms-brand"><img src="/nyu-peruvian-logo-v4.svg" alt=""/><div><b>NYU Perú</b><span>Board portal</span></div></div>
      <nav><button className="active">Dashboard</button></nav>
      <div className="cms-user"><span>Viewer</span><b>{adminEmail}</b><button onClick={logout}>Sign out</button></div>
    </aside>
    <section className="cms-main">
      <header className="cms-top"><div><span className="admin-kicker">Viewer</span><h1>Dashboard</h1></div><div className="cms-actions"><a href="/" target="_blank" rel="noreferrer">View site ↗</a></div></header>
      <div className="dashboard-welcome"><div><span className="admin-kicker">Board account</span><h2>Your account is active.</h2><p>You are signed in to the NYU Perú board portal. Your Viewer role is read-only, so you can access the portal without changing website content.</p></div><a href="/" target="_blank" rel="noreferrer">Open live site ↗</a></div>
      <section className="cms-panel"><span className="admin-kicker">Access</span><h2>Viewer permissions</h2><p>Your account is active and authenticated. If you need editing access, a Super Admin can change your role from Users & Access.</p></section>
    </section>
  </main>;
}
