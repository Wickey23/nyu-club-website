import Link from "next/link";
import { Footer, Header } from "./components/SiteChrome";

const experiences = [
  ["Cultura","Peru in motion","Traditions, history, music, art and identity."],
  ["Comunidad","A place to belong","Socials, collaborations, gatherings and friendships."],
  ["Gastronomía","Taste the story","Food-centered cultural experiences and shared tables."],
  ["Conversaciones","Peruvian voices","Artists, alumni, community leaders and conversations."]
];

export default function HomePage(){
  return <main><Header/>
    <section className="home-hero"><div className="hero-photo"/><div className="hero-shade"/><div className="wrap hero-content"><span className="kicker light">NYU Peruvian Student Association</span><h1>¡VIVA PERÚ!</h1><h2>Peruvian culture. NYU community.<br/>Right in the heart of New York.</h2><p>Celebrating Peru’s culture, history and traditions while building a home for Peruvian students, the diaspora, and everyone at NYU interested in discovering Peru.</p><div className="actions"><Link className="btn red" href="/join">Join our community</Link><Link className="btn outline-light" href="/events">Explore events →</Link></div></div></section>

    <section className="stats"><div className="wrap stats-grid"><div><b>EST.<br/>2016</b></div><div><b>150+</b><span>Community members</span></div><div><b>NYU</b><span>New York City</span></div><div><b>OPEN</b><span>To the NYU community</span></div></div></section>

    <section className="cream-section"><div className="wrap intro-grid"><div><span className="kicker">Our community</span><h2>More than a club.<br/>A home for Peru at NYU.</h2><p>We are a cultural and social community that connects Peruvians, the Peruvian diaspora, and friends of Peru across NYU and New York City.</p><Link className="btn outline" href="/about">Learn more about us</Link></div><div className="photo-card tall"><span>Club community photography</span></div><div className="pillars"><article><i>✦</i><div><h3>Culture</h3><p>Celebrate Peruvian and Andean heritage.</p></div></article><article><i>◎</i><div><h3>Community</h3><p>Connect with Peruvians, the diaspora and the NYU community.</p></div></article><article><i>↗</i><div><h3>Connection</h3><p>Build friendships and relationships across New York.</p></div></article></div></div></section>

    <section className="cream-section pt0"><div className="wrap"><div className="section-title"><span className="kicker">Up next</span><h2>Come experience it.</h2></div><article className="feature-event"><div className="event-image cocoa"/><div className="event-copy"><span className="kicker light">Annual community celebration</span><h3>La Gran Chocolatada</h3><ul><li>December · Date TBA</li><li>6:30 PM · 9:00 PM</li><li>NYU · New York</li></ul><Link href="/events" className="btn red">View event</Link></div></article><Link className="text-link" href="/events">View all events →</Link></div></section>

    <section className="cream-section" id="community"><div className="wrap"><div className="section-title"><span className="kicker">What we do</span><h2>Experiences that celebrate Peru.</h2></div><div className="experience-grid">{experiences.map(([title,sub,desc],i)=><article key={title}><div className={`experience-img exp${i+1}`}/><span className="kicker">{sub}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>

    <section className="join-banner"><div className="wrap join-grid"><div><span className="kicker light">Join the community</span><h2>Peru is the connection.<br/>Community is the reason.</h2><p>Peruvian? Peruvian-American? Interested in the culture? Just looking for community? You’re welcome here.</p><div className="actions"><Link className="btn white" href="/join">Join ¡Viva Perú!</Link><a className="btn outline-light" href="https://www.instagram.com/perunyu/">Follow us</a></div></div><div className="nyc-photo"><span>Peru × New York City</span></div></div></section>
    <Footer/>
  </main>;
}
