import { Footer, Header, PageHero } from "../components/SiteChrome";
import { clubMedia } from "../lib/clubMedia";

const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"});

const events=[
  ["Conversación Musical","Eva Ayllón × Daniela Darcourt","October 11, 2025","NYU · New York",clubMedia.conversation[0]],
  ["La Gran Chocolatada","Annual community celebration","December · Date TBA","NYU · New York",clubMedia.conversation[2]],
  ["Community & Culture","Socials, collaborations and Peruvian pride","More dates coming soon","NYU · New York",clubMedia.conversation[3]]
] as const;

export default function EventsPage(){return <main><Header/><PageHero eyebrow="Events" title="What's happening next." subtitle="Culture, community, food, music and conversations — all in one calendar."/><section className="page-section"><div className="wrap tabs"><b>Featured</b><span>Upcoming</span><span>Past</span></div><div className="wrap event-list">{events.map(([title,tag,date,place,img])=><article key={title}><div className="list-image" style={photo(img)}/><div><span className="kicker">{tag}</span><h2>{title}</h2><p>{date}<br/>{place}</p><button className="btn outline">View details</button></div></article>)}</div></section><Footer/></main>}
