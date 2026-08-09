import { Footer, Header, PageHero } from "../components/SiteChrome";
import { archiveEvents, galleryImages } from "../lib/clubMedia";
import { getLiveSiteContent } from "../lib/liveSiteContent";
import { galleryImageUrl, galleryVideoEmbedUrl, isGoogleDriveUrl } from "../lib/mediaUrl";

export const dynamic = "force-dynamic";
const photo=(src:string,position="center")=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:position,backgroundRepeat:"no-repeat"});
const videoStyle={width:"100%",aspectRatio:"16 / 9",display:"block",border:0,background:"#111"} as const;

export default async function GalleryPage(){
  const site=await getLiveSiteContent();
  return <main><Header/><PageHero eyebrow="Gallery" title="Memories that connect us." subtitle="A sourced archive of the people, events and experiences that make ¡Viva Perú! what it is."/>
    {site.gallery.length>0 && <section className="page-section"><div className="wrap gallery-intro"><div><span className="kicker">Club gallery</span><h2>Published by the board.</h2></div><p>Photos and videos managed directly through the ¡Viva Perú! board CMS.</p></div><div className="wrap sourced-gallery">{site.gallery.map((item)=>{
      const video=item.mediaType==="video";
      const mediaUrl=video?galleryVideoEmbedUrl(item.image):galleryImageUrl(item.image);
      return <article key={item.id} className="sourced-card">
        {video ? (isGoogleDriveUrl(item.image)
          ? <iframe src={mediaUrl} title={item.title} allow="autoplay; fullscreen" allowFullScreen style={videoStyle}/>
          : <video src={mediaUrl} controls playsInline preload="metadata" style={videoStyle}/>)
          : <div className="sourced-photo" style={photo(mediaUrl)} role="img" aria-label={item.title}/>} 
        <div className="sourced-copy"><span className="kicker">Club media · {video?"Video":"Photo"}</span><h2>{item.title}</h2><p>{item.description}</p>{item.sourceUrl&&<a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-link">Original source ↗</a>}</div>
      </article>})}</div></section>}

    <section className="page-section">
      <div className="wrap gallery-intro">
        <div><span className="kicker">Verified club media</span><h2>Photos with their story attached.</h2></div>
        <p>Every image below keeps the source and the description we could verify from the club&apos;s public posts.</p>
      </div>
      <div className="wrap sourced-gallery">{galleryImages.map((item)=><article key={item.id} className="sourced-card"><div className="sourced-photo" style={item.atlasPosition?{...photo(item.image,item.atlasPosition),backgroundSize:"200% 200%"}:photo(item.image)} role="img" aria-label={item.title}/><div className="sourced-copy"><span className="kicker">{item.source}</span><h2>{item.title}</h2><p>{item.description}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-link">View source ↗</a></div></article>)}</div>
    </section>

    <section className="archive-section"><div className="wrap archive-head"><span className="kicker light">Club archive</span><h2>More events found in the public record.</h2><p>These records are ready for original photos and fuller captions as the board adds them.</p></div><div className="wrap archive-grid">{archiveEvents.map((item)=><article key={item.title}><span className="kicker light">{item.date}</span><h3>{item.title}</h3><p>{item.source}</p></article>)}</div></section>
    <Footer/></main>;
}
