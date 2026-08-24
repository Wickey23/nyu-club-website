import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import { clubMedia } from "../lib/clubMedia";
import { getLiveSiteContent } from "../lib/liveSiteContent";
import { getPublicPageSettings,pageCopy } from "../lib/publicPageSettings";

export async function generateMetadata():Promise<Metadata>{const site=await getLiveSiteContent();const formal=site.settings.clubName||"NYU Peruvian Student Association";return{title:`Join | ${formal}`,description:"Join the NYU Peruvian Student Association community, attend events, follow the club and connect with the board."};}
const photo=(src:string,position="center")=>({backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.2),rgba(0,0,0,.04)),url(${src})`,backgroundSize:"cover",backgroundPosition:position,backgroundRepeat:"no-repeat"});
const today=new Date().toISOString().slice(0,10);
const fallbackEngage="https://engage.nyu.edu/organization/viva-peru-all-university";

export default async function JoinPage(){
  const site=await getLiveSiteContent();
  const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";
  const config=(site.settings.cmsConfig||{}) as any;const join=config.join||{};const social=config.social||{};
  const page=await getPublicPageSettings("join",{eyebrow:`Join ${brand}`,title:"Peru is the connection. Community is the reason.",subtitle:"You do not need to be Peruvian to belong here — bring your curiosity, energy and willingness to connect."});
  const email=site.settings.email||"peru@nyu.edu";
  const instagram=site.settings.instagram||"https://www.instagram.com/perunyu/";
  const engage=social.engage||fallbackEngage;const applicationUrl=join.formUrl||engage;const applicationsOpen=join.applicationsOpen!==false;
  const nextEvent=site.events.filter(e=>e.status==="published"&&(!e.date||e.date>=today)).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"))[0];
  const layoutClass=`page-layout-${page.layout.heroAlign} page-layout-${page.layout.contentWidth} page-spacing-${page.layout.sectionSpacing}`;
  return <main className={layoutClass}><Header/><PageHero eyebrow={page.eyebrow.replaceAll("{{brand}}",brand)} title={page.title.replaceAll("{{brand}}",brand)} subtitle={page.subtitle.replaceAll("{{brand}}",brand)}/>
    <section className="page-section"><div className="wrap join-page-grid"><div><span className="kicker">Why join</span><h2>{pageCopy(page,"introHeading","Find your people at NYU.")}</h2><p>{pageCopy(page,"introBody","Meet students across NYU, celebrate Peruvian culture, attend events, discover leadership opportunities and become part of a community that reaches beyond campus into New York City.")}</p>{applicationsOpen?<div className="actions"><a className="btn red" href={applicationUrl} target="_blank" rel="noreferrer">{join.ctaText||"Join NYU Perú"} ↗</a><a className="btn outline" href={`mailto:${email}`}>Email the board</a></div>:<div className="join-closed"><b>Applications are currently closed</b><p>{join.closedMessage||"Applications are currently closed."}</p><a className="btn outline" href={`mailto:${email}`}>Contact the board</a></div>}{join.deadline&&<p className="join-setting-note"><b>Deadline:</b> {join.deadline}</p>}{join.meetingSchedule&&<p className="join-setting-note"><b>Meetings:</b> {join.meetingSchedule}</p>}{join.dues&&<p className="join-setting-note"><b>Dues:</b> {join.dues}</p>}</div><div className="photo-card join-photo" style={photo(clubMedia.conversation[0],"center 35%") }><span>{brand} community</span></div></div>
      <div className="wrap values-row"><article><b>◎</b><h3>Community</h3><p>Make lasting friendships and meet students across schools and class years.</p></article><article><b>✦</b><h3>Culture</h3><p>Celebrate and share Peruvian and Andean heritage through real programming.</p></article><article><b>↗</b><h3>Opportunity</h3><p>Participate, collaborate, volunteer and grow into leadership roles.</p></article></div>
      {join.requirements&&<div className="wrap join-requirements"><span className="kicker">Membership</span><h2>What to know</h2><p>{join.requirements}</p></div>}
    </section>

    <section className="page-section alt"><div className="wrap"><div className="section-title"><span className="kicker">Getting involved</span><h2>{pageCopy(page,"stepsHeading","Three easy ways to start.")}</h2></div><div className="join-steps"><article><span>01</span><h3>Follow the club</h3><p>See event announcements, photos and day-to-day updates.</p><a href={instagram} target="_blank" rel="noreferrer">Open Instagram ↗</a></article><article><span>02</span><h3>Come to an event</h3><p>No application is needed to show up, meet people and experience the community.</p><Link href="/events">See events →</Link></article><article><span>03</span><h3>Stay connected</h3><p>Join through NYU Engage or email the board when you want to help, collaborate or learn more.</p><a href={`mailto:${email}`}>Contact the board →</a></article></div></div></section>

    {nextEvent&&<section className="page-section"><div className="wrap split-feature"><div className="photo-card tall" style={photo(nextEvent.image||clubMedia.conversation[2])}><span>Next event</span></div><div><span className="kicker">Start here</span><h2>{nextEvent.title}</h2><p>{nextEvent.date}{nextEvent.time?` · ${nextEvent.time}`:""}<br/>{nextEvent.location}</p><p>{nextEvent.description}</p><div className="actions"><Link className="btn red" href={`/events/${encodeURIComponent(nextEvent.slug||nextEvent.id)}`}>View event</Link>{nextEvent.rsvpUrl&&<a className="btn outline" href={nextEvent.rsvpUrl} target="_blank" rel="noreferrer">RSVP ↗</a>}</div></div></div></section>}

    <section className="join-banner"><div className="wrap join-grid"><div><span className="kicker light">Questions?</span><h2>{pageCopy(page,"contactHeading","Talk to the board.")}</h2><p>{pageCopy(page,"contactBody","If you are new to NYU, looking to collaborate, or interested in helping with an event, reach out directly.")}</p><div className="actions"><a className="btn white" href={`mailto:${email}`}>{email}</a><a className="btn outline-light" href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a></div></div><div className="nyc-photo" style={photo(clubMedia.metVisit[2])}><span>NYU × Peru × New York</span></div></div></section><Footer/></main>;
}
