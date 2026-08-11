import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import { getLiveSiteContent } from "../lib/liveSiteContent";

export async function generateMetadata():Promise<Metadata>{const site=await getLiveSiteContent();const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";return{title:`Team | ${brand}`,description:"Meet the current and past student leaders of the NYU Peruvian Student Association."};}
export const dynamic = "force-dynamic";
const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center top",backgroundRepeat:"no-repeat"});

export default async function TeamPage(){
  const site=await getLiveSiteContent();
  const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";
  const current=site.team.filter(m=>m.active!==false);
  const past=site.team.filter(m=>m.active===false);
  const years=[...new Set(past.map(m=>m.boardYear).filter(Boolean) as string[])].sort().reverse();
  const card=(member:any)=><article key={member.id}><div className="portrait" style={member.image?photo(member.image):undefined}/><h3>{member.name}</h3><p>{member.role}</p>{member.bio&&<p className="team-bio">{member.bio}</p>}{member.email&&<a href={`mailto:${member.email}`}>{member.email}</a>}</article>;
  return <main><Header/><PageHero eyebrow="Our team" title={`The people behind ${brand}`} subtitle="Meet the student leaders building community, programming and culture at NYU."/>
    <section className="page-section"><div className="wrap"><span className="kicker">Current executive board</span><h2 className="section-heading">Building the next chapter.</h2><div className="team-grid">{current.map(card)}</div>{!current.length&&<div className="event-empty"><h2>Board profiles are being updated.</h2><p>In the meantime, contact the organization through the Join page.</p><Link className="btn red" href="/join">Join / Contact</Link></div>}</div></section>
    {!!past.length&&<section className="cream-section"><div className="wrap"><span className="kicker">Past boards</span><h2 className="section-heading">The students who built the community.</h2>{years.map(year=><section className="past-board-year" key={year}><h3>{year}</h3><div className="team-grid compact">{past.filter(m=>m.boardYear===year).map(card)}</div></section>)}</div></section>}
    <section className="join-banner"><div className="wrap"><span className="kicker light">Get involved</span><h2>Interested in helping build what comes next?</h2><p>Attend an event, meet the board and stay involved throughout the year.</p><Link className="btn white" href="/join">Join the community</Link></div></section>
    <Footer/></main>;
}
