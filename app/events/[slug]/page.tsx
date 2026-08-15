import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Footer, Header } from "../../components/SiteChrome";
import { getLiveSiteContent } from "../../lib/liveSiteContent";
import { galleryImageUrl, galleryVideoEmbedUrl } from "../../lib/mediaUrl";

export const dynamic="force-dynamic";

function fmtDate(value:string){if(!value)return "Date TBA";return new Date(`${value}T12:00:00`).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});}
function fmtTime(value?:string){if(!value)return "";const [h,m]=value.split(":").map(Number);const d=new Date();d.setHours(h,m||0);return d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});}
function googleCalendar(event:any){if(!event.date)return "";const date=event.date.replaceAll("-","");const times=event.time?`${date}T${event.time.replace(":","")}00/${date}T${(event.endTime||event.time).replace(":","")}00`:`${date}/${date}`;const q=new URLSearchParams({action:"TEMPLATE",text:event.title,dates:times,details:event.description||"",location:event.location||""});return `https://calendar.google.com/calendar/render?${q.toString()}`;}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;const site=await getLiveSiteContent();const event=site.events.find(e=>(e.slug||e.id)===slug||e.id===slug);
  if(!event)return{title:"Event | NYU Peruvian Student Association"};
  const formal=site.settings.clubName||"NYU Peruvian Student Association";
  const description=[event.description,fmtDate(event.date),event.location].filter(Boolean).join(" · ").slice(0,220);
  return{title:`${event.title} | ${formal}`,description,openGraph:{title:event.title,description,type:"article",images:event.image?[{url:event.image,alt:event.title}]:undefined},twitter:{card:"summary_large_image",title:event.title,description,images:event.image?[event.image]:undefined}};
}

export default async function EventDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const site=await getLiveSiteContent();const event=site.events.find(e=>(e.slug||e.id)===slug||e.id===slug);if(!event)notFound();const related=site.gallery.filter(g=>g.eventId===event.id).slice(0,8);
  return <main><Header/>
    <section className="event-detail-hero" style={event.image?{backgroundImage:`linear-gradient(90deg,rgba(13,11,10,.9),rgba(13,11,10,.28)),url(${event.image})`}:undefined}><div className="wrap"><span className="kicker light">{event.status==="past"?"Past event":"Upcoming event"}</span><h1>{event.title}</h1><p>{fmtDate(event.date)}{event.time?` · ${fmtTime(event.time)}${event.endTime?`–${fmtTime(event.endTime)}`:""}`:""}<br/>{event.location}</p><div className="actions">{event.rsvpUrl&&<a className="btn red" href={event.rsvpUrl} target="_blank" rel="noreferrer">RSVP / details</a>}{googleCalendar(event)&&<a className="btn outline-light" href={googleCalendar(event)} target="_blank" rel="noreferrer">Add to Google Calendar</a>}</div></div></section>
    <section className="page-section"><div className="wrap event-detail-grid"><article><span className="kicker">About</span><h2>{event.description}</h2>{event.details&&<p className="long-copy">{event.details}</p>}</article><aside className="event-facts"><b>{fmtDate(event.date)}</b>{event.time&&<span>{fmtTime(event.time)}{event.endTime?`–${fmtTime(event.endTime)}`:""}</span>}<span>{event.location}</span>{event.rsvpUrl&&<a href={event.rsvpUrl} target="_blank" rel="noreferrer">Open RSVP ↗</a>}</aside></div></section>
    {!!event.schedule?.length&&<section className="cream-section"><div className="wrap"><span className="kicker">Schedule</span><h2>What to expect.</h2><div className="event-schedule">{event.schedule.map((item,i)=><article key={`${item.time}-${i}`}><b>{item.time}</b><span>{item.label}</span></article>)}</div></div></section>}
    {!!event.faq?.length&&<section className="page-section"><div className="wrap"><span className="kicker">FAQ</span><h2>Before you go.</h2><div className="faq-grid">{event.faq.map((item,i)=><details key={i}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></div></section>}
    {!!related.length&&<section className="cream-section"><div className="wrap"><div className="section-title"><span className="kicker">Event gallery</span><h2>Moments from this event.</h2></div><div className="event-related-gallery">{related.map(item=>item.mediaType==="video"?<iframe key={item.id} src={galleryVideoEmbedUrl(item.image)} title={item.title} allow="autoplay; fullscreen"/>:<img key={item.id} src={galleryImageUrl(item.image)} alt={item.title}/>)}</div><Link className="text-link" href="/gallery">Explore the full gallery →</Link></div></section>}
    <section className="join-banner"><div className="wrap"><span className="kicker light">Stay connected</span><h2>See what&apos;s next.</h2><Link className="btn white" href="/events">All events</Link></div></section><Footer/></main>;
}
