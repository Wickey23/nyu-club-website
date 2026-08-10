import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import { getLiveSiteContent } from "../lib/liveSiteContent";

export const dynamic = "force-dynamic";
const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"});
const today=new Date().toISOString().slice(0,10);
function hrefFor(e:any){return `/events/${encodeURIComponent(e.slug||e.id)}`;}

export default async function EventsPage(){
  const site=await getLiveSiteContent();
  const upcoming=site.events.filter(e=>e.status==="published"&&(!e.date||e.date>=today)).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"));
  const past=site.events.filter(e=>e.status==="past"||(e.date&&e.date<today)).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const card=(event:any)=><article key={event.id}><Link aria-label={`View ${event.title}`} href={hrefFor(event)}><div className="list-image" style={event.image?photo(event.image):undefined}/></Link><div><span className="kicker">{event.status==="past"||event.date<today?"Past event":"Upcoming"}</span><h2><Link href={hrefFor(event)}>{event.title}</Link></h2><p>{event.date}{event.time?` · ${event.time}`:""}<br/>{event.location}</p><p>{event.description}</p><div className="actions"><Link className="btn outline" href={hrefFor(event)}>View event</Link>{event.rsvpUrl&&<a className="text-link" href={event.rsvpUrl} target="_blank" rel="noreferrer">RSVP ↗</a>}</div></div></article>;
  return <main><Header/><PageHero eyebrow="Events" title="What's happening next." subtitle="Culture, community, food, music and conversations — all in one calendar."/>
    <section className="page-section"><div className="wrap tabs"><b>Upcoming</b><span>{upcoming.length} event{upcoming.length===1?"":"s"}</span></div><div className="wrap event-list">{upcoming.map(card)}</div>{!upcoming.length&&<div className="wrap"><p>No upcoming events are published right now. Join the newsletter so you don&apos;t miss the next one.</p></div>}</section>
    {!!past.length&&<section className="cream-section"><div className="wrap tabs"><b>Past events</b><span>Club archive</span></div><div className="wrap event-list compact">{past.map(card)}</div></section>}
    <Footer/></main>;
}
