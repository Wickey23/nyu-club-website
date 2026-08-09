import { Footer, Header, PageHero } from "../components/SiteChrome";
import { getLiveSiteContent } from "../lib/liveSiteContent";

export const dynamic = "force-dynamic";
const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center top",backgroundRepeat:"no-repeat"});

export default async function TeamPage(){
  const site=await getLiveSiteContent();
  return <main><Header/><PageHero eyebrow="Our team" title="The people behind ¡Viva Perú!" subtitle="Meet the student leaders building community, programming and culture at NYU."/><section className="page-section"><div className="wrap"><span className="kicker">Executive board · Current year</span><div className="team-grid">{site.team.map((member)=><article key={member.id}><div className="portrait" style={member.image?photo(member.image):undefined}/><h3>{member.name}</h3><p>{member.role}</p>{member.email&&<a href={`mailto:${member.email}`}>{member.email}</a>}</article>)}</div>{!site.team.length&&<p>Board information will be published here soon.</p>}</div></section><Footer/></main>
}
