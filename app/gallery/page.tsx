import type { Metadata } from "next";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import { archiveEvents, galleryImages } from "../lib/clubMedia";
import { getLiveSiteContent } from "../lib/liveSiteContent";
import GalleryBrowser from "./GalleryBrowser";

export async function generateMetadata():Promise<Metadata>{const site=await getLiveSiteContent();const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";return{title:`Gallery | ${brand}`,description:"Browse photos, videos and sourced archive media from NYU Peruvian Student Association events and community programming."};}
export const dynamic = "force-dynamic";
const photo=(src:string,position="center")=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:position,backgroundRepeat:"no-repeat"});

export default async function GalleryPage(){
  const site=await getLiveSiteContent();
  const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";
  const eventTitles=Object.fromEntries(site.events.map(e=>[e.id,e.title]));
  return <main><Header/><PageHero eyebrow="Gallery" title="Memories that connect us." subtitle={`A growing archive of the people, events and experiences that make ${brand} what it is.`}/>
    {site.gallery.length>0&&<section className="page-section"><div className="wrap gallery-intro"><div><span className="kicker">Club media library</span><h2>Photos and videos managed by the board.</h2></div><p>Filter by year, album or media type. Featured items can also appear across the site and in newsletter campaigns.</p></div><div className="wrap"><GalleryBrowser items={site.gallery} eventTitles={eventTitles}/></div></section>}

    <section className="page-section archive-media-section"><div className="wrap gallery-intro"><div><span className="kicker">Verified public archive</span><h2>Photos with their story attached.</h2></div><p>These sourced records preserve the captions and references we could verify from the club&apos;s public posts.</p></div><div className="wrap sourced-gallery">{galleryImages.map(item=><article key={item.id} className="sourced-card"><div className="sourced-photo" style={item.atlasPosition?{...photo(item.image,item.atlasPosition),backgroundSize:"200% 200%"}:photo(item.image)} role="img" aria-label={item.title}/><div className="sourced-copy"><span className="kicker">{item.source}</span><h2>{item.title}</h2><p>{item.description}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-link">View source ↗</a></div></article>)}</div></section>

    <section className="archive-section"><div className="wrap archive-head"><span className="kicker light">Club archive</span><h2>More events in the public record.</h2><p>These records are preserved while the board continues adding photos, captions and fuller event details.</p></div><div className="wrap archive-grid">{archiveEvents.map(item=><article key={item.title}><span className="kicker light">{item.date}</span><h3>{item.title}</h3><p>{item.source}</p></article>)}</div></section><Footer/></main>;
}
