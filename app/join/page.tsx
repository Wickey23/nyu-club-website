import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import { clubMedia } from "../lib/clubMedia";
import { getLiveSiteContent } from "../lib/liveSiteContent";

export async function generateMetadata():Promise<Metadata>{const site=await getLiveSiteContent();const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";return{title:`Join | ${brand}`,description:"Join the NYU Peruvian Student Association community, attend events, follow the club and connect with the board."};}
const photo=(src:string,position="center")=>({backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.2),rgba(0,0,0,.04)),url(${src})`,backgroundSize:"cover",backgroundPosition:position,backgroundRepeat:"no-repeat"});
const today=new Date().toISOString().slice(0,10);
const engage="https://engage.nyu.edu/organization/viva-peru-all-university";

export default async function JoinPage(){
  const site=await getLiveSiteContent();
  const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";
  const email=site.settings.email||"peru@nyu.edu";
  const instagram=site.settings.instagram||"https://www.instagram.com/perunyu/";
  const nextEvent=site.events.filter(e=>e.status==="published"&&(!e.date||e.date>=today)).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"))[0];
  return <main><Header/><PageHero eyebrow={`Join ${brand}`} title="Peru is the connection. Community is the reason." subtitle="You do not need to be Peruvian to belong here — bring your curiosity, energy and willingness to connect."/>
    <section className="page-section"><div className="wrap join-page-grid"><div><span className="kicker">Why join</span><h2>Find your people at NYU.</h2><p>Meet students across NYU, celebrate Peruvian culture, attend events, discover leadership opportunities and become part of a community that reaches beyond campus into New York City.</p><div className="actions"><a className="btn red" href={engage} target="_blank" rel="noreferrer">Find us on NYU Engage ↗</a><a className="btn outline" href={`mailto:${email}`}>Email the board</a></div></div><div className="photo-card join-photo" style={photo(clubMedia.conversation[0],"center 35%") }><span>{brand} community</span></div></div>
      <div className="wrap values-row"><article><b>◎</b><h3>Community</h3><p>Make lasting friendships and meet students across schools and class years.</p></article><article><b>✦</b><h3>Culture</h3><p>Celebrate and share Peruvian and Andean heritage through real programming.</p></article><article><b>↗</b><h3>Opportunity</h3><p>Participate, collaborate, volunteer and grow into leadership roles.</p></article></div>
    </section>

    <section className="page-section alt"><div className="wrap"><div className="section-title"><span className="kicker">Getting involved</span><h2>Three easy ways to start.</h2></div><div className="join-steps"><article><span>01</span><h3>Follow the club</h3><p>See event announcements, photos and day-to-day updates.</p><a href={instagram} target="_blank" rel="noreferrer">Open Instagram ↗</a></article><article><span>02</span><h3>Come to an event</h3><p>No application is needed to show up, meet people and experience the community.</p><Link href="/events">See events →</Link></article><article><span>03</span><h3>Stay connected</h3><p>Join through NYU Engage or email the board when you want to help, collaborate or learn more.</p><a href={`mailto:${email}`}>Contact the board →</a></article></div></div></section>

    {nextEvent&&<section className="page-section"><div className="wrap split-feature"><div className="photo-card tall" style={photo(nextEvent.image||clubMedia.conversation[2])}><span>Next event</span></div><div><span className="kicker">Start here</span><h2>{nextEvent.title}</h2><p>{nextEvent.date}{nextEvent.time?` · ${nextEvent.time}`:""}<br/>{nextEvent.location}</p><p>{nextEvent.description}</p><div className="actions"><Link className="btn red" href={`/events/${encodeURIComponent(nextEvent.slug||nextEvent.id)}`}>View event</Link>{nextEvent.rsvpUrl&&<a className="btn outline" href={nextEvent.rsvpUrl} target="_blank" rel="noreferrer">RSVP ↗</a>}</div></div></div></section>}

    <section className="join-banner"><div className="wrap join-grid"><div><span className="kicker light">Questions?</span><h2>Talk to the board.</h2><p>If you are new to NYU, looking to collaborate, or interested in helping with an event, reach out directly.</p><div className="actions"><a className="btn white" href={`mailto:${email}`}>{email}</a><a className="btn outline-light" href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></div></div><div className="nyc-photo" style={photo(clubMedia.metVisit[2])}><span>NYU × Peru × New York</span></div></div></section><Footer/></main>;
}
