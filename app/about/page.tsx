import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import { archiveEvents, clubMedia } from "../lib/clubMedia";
import { getLiveSiteContent } from "../lib/liveSiteContent";

export const metadata:Metadata={title:"About | NYU Peruvian Student Association",description:"Learn about the NYU Peruvian Student Association, its mission, community, history and cultural programming at NYU."};
const bg=(src:string,position="center")=>({backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.24),rgba(0,0,0,.08)),url(${src})`,backgroundSize:"cover",backgroundPosition:position});

export default async function AboutPage(){
  const site=await getLiveSiteContent();
  const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";
  const currentBoard=site.team.filter(m=>m.active!==false);
  const years=[...new Set(site.team.map(m=>m.boardYear).filter(Boolean))];
  return <main><Header/><PageHero eyebrow="About us" title="Rooted in culture. Built on community." subtitle={`Meet ${brand} — NYU's Peruvian student community in New York City.`} kind="photo"/>
    <section className="page-section"><div className="wrap prose-grid"><div><span className="kicker">Who we are</span><h2>A home for Peru at NYU.</h2></div><div><p>Founded in 2016, the NYU Peruvian Student Association celebrates Peruvian and Andean culture while creating an inclusive community for Peruvians, the diaspora, and anyone who wants to learn, connect and celebrate together.</p><p>Programming spans food, music, art, heritage, conversations, social events and collaborations across NYU and New York City.</p></div></div>
      <div className="wrap values-row"><article><b>✦</b><h3>Nuestra Misión</h3><p>Celebrate and share Peru&apos;s culture with the NYU community.</p></article><article><b>◎</b><h3>Nuestra Visión</h3><p>Build a strong, inclusive and lasting Peruvian student community.</p></article><article><b>♡</b><h3>Nuestros Valores</h3><p>Orgullo, comunidad, respeto, curiosidad y excelencia.</p></article></div>
    </section>

    <section className="page-section alt"><div className="wrap split-feature"><div className="photo-card sourced-photo" style={bg(clubMedia.conversation[1],"center 35%") }><span>Official club social photography</span></div><div><span className="kicker">Since 2016</span><h2>Culture is the starting point. Connection is the goal.</h2><p className="feature-body">The organization has grown through student-led programs that bring people together around Peruvian identity, shared experiences and relationships that extend beyond a single event.</p><div className="about-fact-grid"><div><b>2016</b><span>Founded at NYU</span></div><div><b>{currentBoard.length||"—"}</b><span>Current board members</span></div><div><b>{years.length||"—"}</b><span>Board years in the archive</span></div></div><div className="actions"><Link className="btn red" href="/team">Meet the board</Link><Link className="btn outline" href="/join">Join the community</Link></div></div></div></section>

    <section className="page-section"><div className="wrap"><div className="section-title"><span className="kicker">Club history</span><h2>Moments from the archive.</h2><p>Programs and collaborations documented through the club&apos;s public record.</p></div><div className="about-timeline">{archiveEvents.map(item=><article key={`${item.date}-${item.title}`}><span>{item.date}</span><div><h3>{item.title}</h3><p>{item.source}</p></div></article>)}</div><div className="actions"><Link className="btn outline" href="/events">Explore events</Link><Link className="btn outline" href="/gallery">Browse the archive</Link></div></div></section>

    <section className="join-banner"><div className="wrap join-grid"><div><span className="kicker light">Everyone is welcome</span><h2>You do not need to be Peruvian to belong here.</h2><p>Come for the culture, the people, the food, the conversations or simply to meet someone new.</p><Link className="btn white" href="/join">How to join</Link></div><div className="nyc-photo" style={bg(clubMedia.metVisit[0])}><span>Peruvian students across New York City</span></div></div></section><Footer/></main>;
}
