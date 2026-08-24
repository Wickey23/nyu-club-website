import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import NewsletterSignup from "../components/NewsletterSignup";
import { getLiveSiteContent } from "../lib/liveSiteContent";
import { getPublicPageSettings,pageCopy } from "../lib/publicPageSettings";

export async function generateMetadata():Promise<Metadata>{const site=await getLiveSiteContent();const formal=site.settings.clubName||"NYU Peruvian Student Association";return{title:`Events | ${formal}`,description:"Upcoming and past events from the NYU Peruvian Student Association, including cultural programs, community gatherings, food, music and conversations."};}
export const dynamic = "force-dynamic";
const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"});
const today=new Date().toISOString().slice(0,10);
function hrefFor(e:any){return `/events/${encodeURIComponent(e.slug||e.id)}`;}

export default async function EventsPage(){
  const site=await getLiveSiteContent();const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";const ec=((site.settings.cmsConfig||{}) as any).events||{};const cta=ec.defaultCta||"RSVP";
  const page=await getPublicPageSettings("events",{eyebrow:"Events",title:"What's happening next.",subtitle:"Culture, community, food, music and conversations — all in one calendar."});
  const upcoming=site.events.filter(e=>e.status==="published"&&(!e.date||e.date>=today)).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999"));
  const past=site.events.filter(e=>e.status==="past"||(e.date&&e.date<today)).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const card=(event:any)=>{const isPast=event.status==="past"||Boolean(event.date&&event.date<today);const showRsvp=Boolean(event.rsvpUrl)&&!(isPast&&ec.hideRsvpAfterEvent!==false);return <article key={event.id}><Link aria-label={`View ${event.title}`} href={hrefFor(event)}><div className="list-image" style={event.image?photo(event.image):undefined}/></Link><div><span className="kicker">{isPast?"Past event":"Upcoming"}</span><h2><Link href={hrefFor(event)}>{event.title}</Link></h2><p>{event.date}{event.time?` · ${event.time}`:""}<br/>{event.location}</p><p>{event.description}</p><div className="actions"><Link className="btn outline" href={hrefFor(event)}>View event</Link>{showRsvp&&<a className="text-link" href={event.rsvpUrl} target="_blank" rel="noreferrer" data-track="rsvp">{cta} ↗</a>}</div></div></article>};
  const layoutClass=`page-layout-${page.layout.heroAlign} page-layout-${page.layout.contentWidth} page-spacing-${page.layout.sectionSpacing}`;
  return <main className={layoutClass}><Header/><PageHero eyebrow={page.eyebrow} title={page.title.replaceAll("{{brand}}",brand)} subtitle={page.subtitle.replaceAll("{{brand}}",brand)}/>
    <section className="page-section"><div className="wrap tabs"><b>{pageCopy(page,"upcomingHeading","Upcoming")}</b><span>{upcoming.length} event{upcoming.length===1?"":"s"}</span></div><div className="wrap event-list">{upcoming.map(card)}</div>{!upcoming.length&&<div className="wrap event-empty"><h2>Nothing is published yet.</h2><p>{pageCopy(page,"emptyState","The board is planning what comes next. Join the newsletter below and you'll get the next announcement in your inbox.")}</p></div>}</section>
    {!!past.length&&<section className="cream-section"><div className="wrap tabs"><b>{pageCopy(page,"pastHeading","Past events")}</b><span>Club archive</span></div><div className="wrap event-list compact">{past.map(card)}</div></section>}
    <NewsletterSignup/><Footer/></main>;
}
