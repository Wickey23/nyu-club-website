const nav = ["About", "Events", "Culture", "Community", "Team", "Gallery"];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <div className="shell nav">
          <a className="brand" href="#top">¡VIVA PERÚ!</a>
          <nav className="nav-links" aria-label="Primary navigation">
            {nav.map((item) => <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>)}
            <a className="nav-cta" href="#join">Join us</a>
          </nav>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="shell hero-inner">
          <div className="eyebrow">NYU Peruvian Student Association</div>
          <h1 className="display">¡Viva Perú!</h1>
          <p className="hero-copy">Peruvian culture. NYU community. Right in the heart of New York.</p>
          <div className="hero-actions">
            <a className="button primary" href="#join">Join our community</a>
            <a className="button ghost" href="#events">Explore events →</a>
          </div>
        </div>
      </section>

      <section className="identity-strip" aria-label="Organization highlights">
        <div className="shell identity-grid">
          <div className="identity-item"><strong>PERÚ × NYU</strong><span>Culture meets campus</span></div>
          <div className="identity-item"><strong>EST. 2016</strong><span>Growing in New York City</span></div>
          <div className="identity-item"><strong>NYC</strong><span>Our community beyond campus</span></div>
          <div className="identity-item"><strong>ALL NYU</strong><span>Everyone is welcome</span></div>
        </div>
      </section>

      <section className="section white" id="about">
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">Our community</div><h2 className="display">More than a club.</h2></div>
            <p>A home for Peru at NYU — celebrating culture, building friendships, and creating connections across New York.</p>
          </div>
          <div className="community-grid">
            <div className="photo-placeholder"><span>Club photography will be managed from /admin/media</span></div>
            <div className="value-stack">
              <div className="value-card"><h3>Culture</h3><p>Celebrate Peruvian and Andean heritage through music, food, history, art, and tradition.</p></div>
              <div className="value-card"><h3>Community</h3><p>Connect Peruvians, the Peruvian diaspora, and students who simply want to discover the culture.</p></div>
              <div className="value-card"><h3>Connection</h3><p>Build relationships across NYU and the wider Peruvian community of New York City.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="events">
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">Up next</div><h2 className="display">Come experience it.</h2></div>
            <p>The featured event will be selected from the admin dashboard and updated automatically as programming changes.</p>
          </div>
          <article className="event-card">
            <div className="event-meta"><span>FEATURED EVENT</span><span>DATE TBD</span><span>NYU · NEW YORK</span></div>
            <div><h3 className="display">La Gran Chocolatada</h3><div className="hero-actions" style={{ marginTop: 28 }}><a className="button light" href="#">View event →</a></div></div>
          </article>
        </div>
      </section>

      <section className="section white" id="community">
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">What we do</div><h2 className="display">Bring Peru to NYU.</h2></div>
          </div>
          <div className="card-grid">
            <article className="editorial-card"><span className="eyebrow">01</span><div><h3 className="display">Cultura</h3><p>Traditions, history, music, art, and identity.</p></div></article>
            <article className="editorial-card"><span className="eyebrow">02</span><div><h3 className="display">Comunidad</h3><p>Socials, collaborations, gatherings, and friendships.</p></div></article>
            <article className="editorial-card"><span className="eyebrow">03</span><div><h3 className="display">Gastronomía</h3><p>Experiences centered around one of Peru's greatest cultural exports: its food.</p></div></article>
            <article className="editorial-card"><span className="eyebrow">04</span><div><h3 className="display">Conversaciones</h3><p>Artists, alumni, community leaders, and Peruvian voices.</p></div></article>
          </div>
        </div>
      </section>

      <section className="section red" id="culture">
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">Discover Peru</div><h2 className="display">One country. Many worlds.</h2></div>
            <p>A future editorial section for regional culture, traditions, stories, and club programming tied to each part of Peru.</p>
          </div>
          <div className="peru-regions">
            <div className="region"><strong>Costa</strong><span>Lima · Ica · Trujillo · Piura</span></div>
            <div className="region"><strong>Sierra</strong><span>Cusco · Arequipa · Ayacucho</span></div>
            <div className="region"><strong>Selva</strong><span>Iquitos · Madre de Dios · Amazonía</span></div>
          </div>
        </div>
      </section>

      <section className="section white" id="gallery">
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">Gallery</div><h2 className="display">This is ¡Viva Perú!</h2></div>
            <p>Selected Instagram and club photography will become curated albums instead of a fragile live social-media embed.</p>
          </div>
          <div className="gallery-grid">
            <div className="gallery-tile">Signature event</div>
            <div className="gallery-tile">Community</div>
            <div className="gallery-tile">Culture</div>
            <div className="gallery-tile">New York City</div>
          </div>
        </div>
      </section>

      <section className="section" id="team">
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">Leadership</div><h2 className="display">Meet the people behind ¡Viva Perú!</h2></div>
            <p>Board members, roles, portraits, bios, and leadership years will all be editable from the team manager.</p>
          </div>
        </div>
      </section>

      <section className="section red" id="join">
        <div className="shell join-wrap">
          <div>
            <div className="eyebrow">Join the community</div>
            <h2 className="display">Peru is the connection. Community is the reason.</h2>
            <p>Peruvian? Peruvian-American? Interested in the culture? Just looking for community? You are welcome here.</p>
          </div>
          <a className="button light" href="mailto:peru@nyu.edu">Join ¡Viva Perú!</a>
        </div>
      </section>

      <footer className="footer">
        <div className="shell">
          <div className="footer-grid">
            <div><h3>¡VIVA PERÚ!</h3><p>NYU Peruvian Student Association<br />New York University<br />New York, NY</p></div>
            <div><div className="eyebrow">Explore</div><p>About<br />Events<br />Culture<br />Gallery</p></div>
            <div><div className="eyebrow">Connect</div><p>@perunyu<br />LinkedIn<br />peru@nyu.edu</p></div>
            <div><div className="eyebrow">Admin</div><p><a href="/admin">Content dashboard →</a></p></div>
          </div>
          <div className="footer-bottom">Made in New York. Con orgullo peruano.</div>
        </div>
      </footer>
    </main>
  );
}
