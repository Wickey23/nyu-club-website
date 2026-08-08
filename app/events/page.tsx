import { Footer, Header, PageHero } from "../components/SiteChrome";
const events=[
  ["La Gran Chocolatada","Annual community celebration","December · Date TBA","Kimmel Center, NYU","cocoa"],
  ["Ceviche Night","Food, culture & community","Date TBA","NYU · New York","ceviche"],
  ["Conversación Musical","Artists, alumni & Peruvian voices","Date TBA","NYU · New York","music"]
];
export default function EventsPage(){return <main><Header/><PageHero eyebrow="Events" title="What's happening next." subtitle="Culture, community, food, music and conversations — all in one calendar."/><section className="page-section"><div className="wrap tabs"><b>Upcoming</b><span>Past</span><span>Calendar</span></div><div className="wrap event-list">{events.map(([title,tag,date,place,img])=><article key={title}><div className={`list-image ${img}`}/><div><span className="kicker">{tag}</span><h2>{title}</h2><p>{date}<br/>{place}</p><button className="btn outline">View details</button></div></article>)}</div></section><Footer/></main>}