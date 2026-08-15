import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header, PageHero } from "../components/SiteChrome";
import { getLiveSiteContent } from "../lib/liveSiteContent";
import { getPublicPageSettings,pageCopy } from "../lib/publicPageSettings";
import TeamYearFilter from "./TeamYearFilter";

export async function generateMetadata():Promise<Metadata>{const site=await getLiveSiteContent();const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";return{title:`Team | ${brand}`,description:"Meet the current and past student leaders of the NYU Peruvian Student Association."};}
export const dynamic = "force-dynamic";

export default async function TeamPage(){
  const site=await getLiveSiteContent();
  const brand=site.settings.shortName||site.settings.clubName||"NYU Perú";
  const page=await getPublicPageSettings("team",{eyebrow:"Our team",title:`The people behind ${brand}`,subtitle:"Meet the student leaders building community, programming and culture at NYU."});
  const current=site.team.filter(m=>m.active!==false);
  const past=site.team.filter(m=>m.active===false);
  const layoutClass=`page-layout-${page.layout.heroAlign} page-layout-${page.layout.contentWidth} page-spacing-${page.layout.sectionSpacing}`;
  return <main className={layoutClass}><Header/><PageHero eyebrow={page.eyebrow} title={page.title.replaceAll("{{brand}}",brand)} subtitle={page.subtitle.replaceAll("{{brand}}",brand)}/>
    <section className="page-section"><div className="wrap"><span className="kicker">Leadership archive</span><h2 className="section-heading">{pageCopy(page,"currentHeading","Building the next chapter.")}</h2>{pageCopy(page,"currentBody","")&&<p className="team-page-intro">{pageCopy(page,"currentBody","")}</p>}<TeamYearFilter members={site.team}/>{!current.length&&!past.length&&<div className="event-empty"><h2>Board profiles are being updated.</h2><p>{pageCopy(page,"emptyState","In the meantime, contact the organization through the Join page.")}</p><Link className="btn red" href="/join">Join / Contact</Link></div>}</div></section>
    <section className="join-banner"><div className="wrap"><span className="kicker light">Get involved</span><h2>Interested in helping build what comes next?</h2><p>Attend an event, meet the board and stay involved throughout the year.</p><Link className="btn white" href="/join">Join the community</Link></div></section>
    <Footer/></main>;
}
