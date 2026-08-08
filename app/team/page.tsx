import { Footer, Header, PageHero } from "../components/SiteChrome";
import site from "../../content/site.json";

const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center top",backgroundRepeat:"no-repeat"});

export default function TeamPage(){return <main><Header/><PageHero eyebrow="Our team" title="The people behind ¡Viva Perú!" subtitle="Meet the student leaders building community, programming and culture at NYU."/><section className="page-section"><div className="wrap"><span className="kicker">Executive board · Current year</span><div className="team-grid">{site.team.map((member)=><article key={member.id}><div className="portrait" style={member.image?photo(member.image):undefined}/><h3>{member.name}</h3><p>{member.role}</p>{member.email&&<a href={`mailto:${member.email}`}>{member.email}</a>}</article>)}</div></div></section><Footer/></main>}
