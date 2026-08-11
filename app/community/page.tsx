import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import NewsletterSignup from "../components/NewsletterSignup";
import { clubMedia } from "../lib/clubMedia";
import { getLiveSiteContent } from "../lib/liveSiteContent";

export const metadata:Metadata={title:"Community | NYU Peruvian Student Association",description:"Explore the NYU Peruvian Student Association community, collaborations, gatherings and ways to get involved across NYU and New York City."};
export const dynamic="force-dynamic";
export default async function CommunityPage(){
  const site=await getLiveSiteContent();const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";
  return <main><Header/><PageHero eyebrow="Community" title="Peru is the connection. Community is the reason." subtitle="Friendship, collaboration and culture across NYU and New York City."/>
    <section className="page-section"><div className="wrap split-feature"><div><span className="kicker">Community in New York</span><h2>Shared tables. Shared stories.</h2><p>{brand} creates space for students to connect through cultural programs, meals, collaborations and everyday community.</p><p>NYU Engage documents association members gathering at Warique Restaurant in Brooklyn to enjoy Peruvian cuisine and strengthen bonds.</p><a className="text-link" href="https://engage.nyu.edu/organization/viva-peru-all-university/gallery" target="_blank" rel="noreferrer">Source: NYU Engage →</a></div><div className="photo-card tall" style={clubMedia.engage.warique}><span>Community gathering · Warique</span></div></div></section>
    <section className="page-section alt"><div className="wrap split-feature reverse"><div className="photo-card tall" style={clubMedia.engage.jointBoards}><span>NYU × Columbia · 2024–25</span></div><div><span className="kicker">Collaboration</span><h2>A wider Peruvian student network.</h2><p>The 2024–2025 Executive Boards of NYU and Columbia University&apos;s Peruvian Student Associations came together to strengthen ties between their organizations and celebrate Peruvian culture.</p><p>That same cross-campus spirit appears in collaborations with CUNY students, the Consulate General of Peru in New York, artists, restaurants and cultural institutions.</p><Link className="text-link" href="/gallery">Explore the community archive →</Link></div></div></section>
    <section className="page-section"><div className="wrap"><span className="kicker">Find your place</span><h2 className="section-heading">There is more than one way to belong.</h2><div className="info-grid"><article><h3>Come to an event</h3><p>Start with a cultural program, social, dinner, performance or conversation.</p><Link href="/events">See upcoming events →</Link></article><article><h3>Stay in the loop</h3><p>Newsletter subscribers get upcoming events and community highlights without needing to check social media.</p><a href="#newsletter">Join the newsletter →</a></article><article><h3>Follow the community</h3><p>See what the club is doing across NYU and New York.</p><a href={site.settings.instagram||"https://www.instagram.com/perunyu/"} target="_blank" rel="noreferrer">Instagram →</a></article></div></div></section>
    <div id="newsletter"><NewsletterSignup/></div>
    <Footer/></main>;
}
