import Link from "next/link";
import { Footer, Header } from "./components/SiteChrome";
import { clubMedia } from "./lib/clubMedia";
import { siteContent as site } from "./lib/siteContent";

const experiences = [
  ["Cultura","Peru in motion","Traditions, history, music, art and identity."],
  ["Comunidad","A place to belong","Socials, collaborations, gatherings and friendships."],
  ["Gastronomía","Taste the story","Food-centered cultural experiences and shared tables."],
  ["Conversaciones","Peruvian voices","Artists, alumni, community leaders and conversations."]
];
const photo=(src:string,position="center")=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:position,backgroundRepeat:"no-repeat"});

export default function HomePage(){
  const featured = site.events.find((e)=>e.id===site.homepage.featuredEventId) || site.events.find((e)=>e.status==="published") || site.events[0];
  const heroImage = site.homepage.heroImage || clubMedia.conversation[1];
  return <main><Header/>
    <section className="home-hero"><div className="hero-photo" style={photo(heroImage,"center 38%")}/><div className="hero-shade"/><div className="wrap hero-content"><span className="kicker light">{site.settings.clubName}</span><h1>{site.settings.shortName.toUpperCase()}</h1><h2>{site.homepage.headline}</h2><p>{site.homepage.description}</p><div className="actions"><Link className="btn red" href="/join">Join our community</Link><Link className="btn outline-light" href="/events">Explore events →</Link></div></div></section>

    <section className="stats"><div className="wrap stats-grid"><div><b>EST.<br/>2016</b></div><div><b>150+</b><span>Community members</span></div><div><b>NYU</b><span>New York City</span></div><div><b>OPEN</b><span>To the NYU community</span></div></div></section>

    <section className="cream-section"><div className="wrap intro-grid"><div><span className="kicker">Our community</span><h2>More than a club.<br/>A home for Peru at NYU.</h2><p>We are a cultural and social community that connects Peruvians, the Peruvian diaspora, and friends of Peru across NYU and New York City.</p><Link className="btn outline" href="/about">Learn more about us</Link></div><div className="photo-card tall" style={photo(clubMedia.conversation[2])}><span>Community at ¡Viva Perú!</span></div><div className="pillars"><article><i>✦</i><div><h3>Culture</h3><p>Celebrate Peruvian and Andean heritage.</p></div></article><article><i>◎</i><div><h3>Community</h3><p>Connect with Peruvians, the diaspora and the NYU community.</p></div></article><article><i>↗</i><div><h3>Connection</h3><p>Build friendships and relationships across New York.</p></div></article></div></div></section>

    {featured && <section className="cream-section pt0"><div className="wrap"><div className="section-title"><span className="kicker">Featured event</span><h2>Come experience it.</h2></div><article className="feature-event"><div className="event-image" style={photo(featured.image || clubMedia.conversation[0])}/><div className="event-copy"><span className="kicker light">{featured.status === "published" ? "Upcoming" : "Featured"}</span><h3>{featured.title}</h3><p>{featured.description}</p><ul>{featured.date&&<li>{featured.date}</li>}{featured.time&&<li>{featured.time}</li>}<li>{featured.location}</li></ul><Link href="/events" className="btn red">View events</Link></div></article><Link className="text-link" href="/events">View all events →</Link></div></section>}

    <section className="cream-section" id="community"><div className="wrap"><div className="section-title"><span className="kicker">What we do</span><h2>Experiences that celebrate Peru.</h2></div><div className="experience-grid">{experiences.map(([title,sub,desc],i)=><article key={title}><div className="experience-img" style={photo(clubMedia.conversation[i%clubMedia.conversation.length])}/><span className="kicker">{sub}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>

    <section className="join-banner"><div className="wrap join-grid"><div><span className="kicker light">Join the community</span><h2>Peru is the connection.<br/>Community is the reason.</h2><p>Peruvian? Peruvian-American? Interested in the culture? Just looking for community? You’re welcome here.</p><div className="actions"><Link className="btn white" href="/join">Join ¡Viva Perú!</Link><a className="btn outline-light" href={site.settings.instagram}>Follow us</a></div></div><div className="nyc-photo" style={photo(clubMedia.conversation[3])}><span>Peru × New York City</span></div></div></section>
    <Footer/>
  </main>;
}
