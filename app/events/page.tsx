import { Footer, Header, PageHero } from "../components/SiteChrome";
import { getLiveSiteContent } from "../lib/liveSiteContent";

export const dynamic = "force-dynamic";
const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"});

export default async function EventsPage(){
  const site=await getLiveSiteContent();
  const events=[...site.events].sort((a,b)=>a.date.localeCompare(b.date));
  return <main><Header/><PageHero eyebrow="Events" title="What's happening next." subtitle="Culture, community, food, music and conversations — all in one calendar."/><section className="page-section"><div className="wrap tabs"><b>Events</b><span>Published by the board</span></div><div className="wrap event-list">{events.map((event)=><article key={event.id}><div className="list-image" style={event.image?photo(event.image):undefined}/><div><span className="kicker">{event.status}</span><h2>{event.title}</h2><p>{event.date}{event.time?` · ${event.time}`:""}<br/>{event.location}</p><p>{event.description}</p>{event.rsvpUrl?<a className="btn outline" href={event.rsvpUrl} target="_blank" rel="noreferrer">RSVP</a>:null}</div></article>)}</div>{!events.length&&<div className="wrap"><p>No published events right now. Check back soon.</p></div>}</section><Footer/></main>
}
