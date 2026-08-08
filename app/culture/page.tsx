import { Footer, Header, PageHero } from "../components/SiteChrome";
import { clubMedia } from "../lib/clubMedia";

const bg=(src:string)=>({backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.18),rgba(0,0,0,.08)),url(${src})`,backgroundSize:"cover",backgroundPosition:"center"});
const cards=[
  ["Music","Peru’s sound, from tradition to today.",clubMedia.conversation[0]],
  ["Food","Stories shared through the table.",clubMedia.conversation[2]],
  ["Heritage","History, identity and place.",clubMedia.wsnDance.flags],
  ["Dance","Tradition in motion at NYU.",clubMedia.wsnDance.pair],
  ["Community","Celebrations that keep us connected.",clubMedia.conversation[3]]
];

export default function CulturePage(){return <main><Header/><PageHero eyebrow="Culture" title="Peru is diverse. Peru is beautiful." subtitle="Explore the traditions, food, music, history and stories that shape Peru."/><section className="page-section"><div className="wrap tabs"><b>All</b><span>Music</span><span>Food</span><span>Heritage</span><span>Dance</span><span>Community</span></div><div className="wrap culture-grid">{cards.map(([t,d,src])=><article key={t}><div className="culture-photo" style={bg(src)}/><h2>{t}</h2><p>{d}</p></article>)}</div><div className="wrap source-note">Dance photography: Matt Petres for Washington Square News, from NYU’s 2023 “¡Bailar Para Honrar!” coverage, which documents ¡Viva Perú! performing Marinera Norteña. <a href={clubMedia.wsnDance.source}>View source →</a></div></section><section className="region-strip"><div className="wrap"><article><b>Costa</b><span>The coast</span></article><article><b>Sierra</b><span>The mountains</span></article><article><b>Selva</b><span>The jungle</span></article></div></section><Footer/></main>}
