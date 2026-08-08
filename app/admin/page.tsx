const adminNav = [
  "Dashboard",
  "Homepage",
  "Events",
  "Programs",
  "Team",
  "Gallery",
  "News",
  "Partners",
  "Members",
  "Messages",
  "Media",
  "Navigation",
  "Users & Permissions",
  "Activity Log",
  "Site Settings",
];

export default function AdminPage() {
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">¡VIVA PERÚ! <span style={{ opacity: .45 }}>ADMIN</span></div>
        <nav className="admin-nav" aria-label="Admin navigation">
          {adminNav.map((item) => <a key={item} href="#">{item}</a>)}
        </nav>
      </aside>
      <section className="admin-main">
        <div className="admin-top">
          <div><div className="eyebrow">Content management</div><h1>Dashboard</h1></div>
          <a className="button primary" href="/">View website →</a>
        </div>

        <div className="admin-grid">
          <div className="admin-stat"><strong>3</strong><span>Upcoming events</span></div>
          <div className="admin-stat"><strong>6</strong><span>Active board members</span></div>
          <div className="admin-stat"><strong>4</strong><span>Gallery albums</span></div>
          <div className="admin-stat"><strong>2</strong><span>Draft updates</span></div>
        </div>

        <div className="admin-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div><div className="eyebrow">Homepage</div><h2>Featured content</h2></div>
            <button className="button primary">Edit homepage</button>
          </div>
          <div className="admin-row"><strong>Hero</strong><span className="pill">Published</span><a href="#">Edit →</a></div>
          <div className="admin-row"><strong>Featured event · La Gran Chocolatada</strong><span className="pill">Published</span><a href="#">Edit →</a></div>
          <div className="admin-row"><strong>Gallery selection</strong><span className="pill">Needs photos</span><a href="#">Manage →</a></div>
        </div>

        <div className="admin-panel">
          <div><div className="eyebrow">Content pipeline</div><h2>Upcoming events</h2></div>
          <div className="admin-row"><strong>La Gran Chocolatada</strong><span className="pill">Featured</span><a href="#">Edit →</a></div>
          <div className="admin-row"><strong>General Meeting</strong><span className="pill">Draft</span><a href="#">Edit →</a></div>
          <div className="admin-row"><strong>Culture Night</strong><span className="pill">Draft</span><a href="#">Edit →</a></div>
        </div>

        <div className="admin-panel">
          <div><div className="eyebrow">Media workflow</div><h2>Import club photography</h2></div>
          <p style={{ maxWidth: 720, lineHeight: 1.7, color: "#666" }}>The next CMS phase will let admins upload originals from @perunyu, record the Instagram source URL, crop for desktop and mobile, add alt text, assign images to events/albums, and choose homepage features.</p>
          <button className="button primary">Open media library</button>
        </div>
      </section>
    </main>
  );
}
