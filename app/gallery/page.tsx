import { Footer, Header, PageHero } from "../components/SiteChrome";
import { archiveEvents, galleryImages } from "../lib/clubMedia";

const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"});

export default function GalleryPage(){
  return <main><Header/><PageHero eyebrow="Gallery" title="Memories that connect us." subtitle="A sourced archive of the people, events and experiences that make ¡Viva Perú! what it is."/>
    <section className="page-section">
      <div className="wrap gallery-intro">
        <div><span className="kicker">Verified club media</span><h2>Photos with their story attached.</h2></div>
        <p>Every image below includes the event, date, source, and the description we could verify from the club's public posts. We preserve partial-source limitations instead of inventing captions.</p>
      </div>

      <div className="wrap sourced-gallery">
        {galleryImages.map((item)=><article key={item.id} className="sourced-card">
          <div className="sourced-photo" style={photo(item.src)} role="img" aria-label={item.alt}/>
          <div className="sourced-copy">
            <span className="kicker">{item.date}</span>
            <h2>{item.title}</h2>
            <h3>{item.event}</h3>
            <p>{item.description}</p>
            <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-link">Source: {item.sourceLabel} ↗</a>
          </div>
        </article>)}
      </div>
    </section>

    <section className="archive-section">
      <div className="wrap archive-head"><span className="kicker light">Club archive</span><h2>More events found in the public record.</h2><p>These event records are ready for their original photos when we surface or receive them.</p></div>
      <div className="wrap archive-grid">
        {archiveEvents.map((item)=><article key={item.title}>
          <span className="kicker light">{item.date}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">View source ↗</a>
        </article>)}
      </div>
    </section>
    <Footer/></main>;
}
