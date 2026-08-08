import Link from "next/link";

const nav = [
  ["About", "/about"], ["Events", "/events"], ["Culture", "/culture"],
  ["Community", "/#community"], ["Team", "/team"], ["Gallery", "/gallery"]
] as const;

export function Header() {
  return <header className="topbar"><div className="wrap topbar-in"><Link href="/" className="logo">¡VIVA PERÚ!<small>NYU Peruvian Student Association</small></Link><nav>{nav.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}<Link className="join-btn" href="/join">Join us</Link></nav></div></header>;
}

export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-grid"><div><div className="logo footer-logo">¡VIVA PERÚ!<small>NYU Peruvian Student Association</small></div><p>Made in New York.<br/>Con orgullo peruano. 🇵🇪</p></div><div><b>Explore</b><Link href="/about">About</Link><Link href="/events">Events</Link><Link href="/culture">Culture</Link><Link href="/team">Team</Link></div><div><b>Connect</b><span>@perunyu</span><span>LinkedIn</span><a href="mailto:peru@nyu.edu">peru@nyu.edu</a></div><div><b>Location</b><span>New York University</span><span>New York, NY</span><Link href="/admin">Admin</Link></div></div><div className="wrap copyright">© NYU Peruvian Student Association</div></footer>;
}

export function PageHero({eyebrow,title,subtitle,kind="dark"}:{eyebrow:string;title:string;subtitle:string;kind?:"dark"|"photo"}) {
  return <section className={`page-hero ${kind}`}><div className="wrap"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></section>;
}
