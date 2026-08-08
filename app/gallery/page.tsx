import { Footer, Header, PageHero } from "../components/SiteChrome";
import { clubMedia } from "../lib/clubMedia";

const labels=["Conversación Musical","Community","Peruvian voices","Culture"];

export default function GalleryPage(){
  return <main><Header/><PageHero eyebrow="Gallery" title="Memories that connect us." subtitle="A curated archive of the people, events and experiences that make ¡Viva Perú! what it is."/>
    <section className="page-section"><div className="wrap tabs"><b>All albums</b><span>Conversations</span><span>Community</span><span>Culture</span></div>
      <div className="wrap gallery-page-grid real-gallery">
        {clubMedia.conversation.map((src,i)=><article key={src} className={`g${i+1}`}><div className="real-photo" style={{backgroundImage:`url(${src})`}}/><span>{labels[i]}</span></article>)}
      </div>
      <div className="wrap source-note">Photos from official NYU Peruvian Student Association social posts. Original files can be replaced from the admin media library.</div>
    </section><Footer/></main>;
}
