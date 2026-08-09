import Link from "next/link";
import { getLiveSiteContent } from "../lib/liveSiteContent";

const nav = [
  ["About", "/about"], ["Events", "/events"], ["Culture", "/culture"],
  ["Community", "/community"], ["Team", "/team"], ["Gallery", "/gallery"]
] as const;

export async function Header() {
  const site = await getLiveSiteContent();
  const shortName = site.settings.shortName || "¡Viva Perú!";
  const clubName = site.settings.clubName || "NYU Peruvian Student Association";

  return <header className="topbar">
    <div className="wrap topbar-in">
      <Link href="/" className="site-brand" aria-label={`${shortName} home`}>
        <img className="site-brand-mark" src="/nyu-peruvian-logo-v4.svg" alt={`${clubName} logo`} />
        <span className="site-brand-copy"><b>{shortName.toUpperCase()}</b><small>{clubName}</small></span>
      </Link>
      <nav className="desktop-nav">{nav.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}<Link className="join-btn" href="/join">Join us</Link></nav>
      <details className="mobile-nav">
        <summary aria-label="Open navigation"><span></span><span></span><span></span></summary>
        <div className="mobile-nav-panel">{nav.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}<Link className="join-btn" href="/join">Join us</Link></div>
      </details>
    </div>
  </header>;
}

export async function Footer() {
  const site = await getLiveSiteContent();
  const shortName = site.settings.shortName || "¡Viva Perú!";
  const clubName = site.settings.clubName || "NYU Peruvian Student Association";
  const email = site.settings.email || "peru@nyu.edu";

  return <footer className="site-footer"><div className="wrap footer-grid"><div><div className="footer-brand"><img className="footer-brand-mark" src="/nyu-peruvian-logo-v4.svg" alt={`${clubName} logo`}/><span><b>{shortName.toUpperCase()}</b><small>{clubName}</small></span></div><p>Made in New York.<br/>Con orgullo peruano. 🇵🇪</p></div><div><b>Explore</b><Link href="/about">About</Link><Link href="/events">Events</Link><Link href="/culture">Culture</Link><Link href="/team">Team</Link></div><div><b>Connect</b><a href={site.settings.instagram || "https://www.instagram.com/perunyu/"}>Instagram</a><a href={site.settings.linkedin || "https://www.linkedin.com/company/nyuperu"}>LinkedIn</a><a href={`mailto:${email}`}>{email}</a></div><div><b>Location</b><span>New York University</span><span>New York, NY</span><Link href="/admin">Admin</Link></div></div><div className="wrap copyright">© {clubName}</div></footer>;
}

export function PageHero({eyebrow,title,subtitle,kind="dark"}:{eyebrow:string;title:string;subtitle:string;kind?:"dark"|"photo"}) {
  return <section className={`page-hero ${kind}`}><div className="wrap"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></section>;
}
