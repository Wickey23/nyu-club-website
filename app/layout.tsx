import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { createSupabaseServerClient } from "./lib/supabase/server";
import SiteAnalytics from "./components/SiteAnalytics";
import AuthLandingRedirect from "./components/AuthLandingRedirect";
import GlobalSiteControls from "./components/GlobalSiteControls";
import "./globals.css";
import "./gallery-extra.css";
import "./home-media.css";
import "./home-responsive.css";
import "./newsletter.css";
import "./phase2.css";
import "./page-polish.css";
import "./instagram.css";
import "./public-pages-editor.css";
import "./team-filter.css";
import "./site-controls.css";

const sans=DM_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});
const display=Playfair_Display({subsets:["latin"],variable:"--font-display",display:"swap"});
const fallbackClubName="NYU Peruvian Student Association";
const fallbackShortName="NYU Perú";
const fallbackSiteUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://nyuperu.org";

async function readSettings(){
 try{const s=await createSupabaseServerClient();const{data}=await s.from("site_settings").select("club_name,short_name,cms_config").eq("id",1).single();return data}catch{return null}
}

export async function generateMetadata():Promise<Metadata>{
 const data=await readSettings();
 const clubName=data?.club_name?.trim()||fallbackClubName;const shortName=data?.short_name?.trim()||fallbackShortName;const config=(data?.cms_config||{}) as any;const seo=config.seo||{};const branding=config.branding||{};
 const siteUrl=seo.canonicalDomain||fallbackSiteUrl;const title=clubName;const description=seo.defaultDescription||`${clubName} — NYU's Peruvian student community for culture, events, community, and connection in New York City.`;const icon=branding.favicon||branding.primaryLogo||"/nyu-peruvian-logo-v4.svg";const socialImage=seo.defaultOgImage||branding.primaryLogo||"/nyu-peruvian-logo-v4.svg";const indexing=seo.indexingEnabled!==false;
 return{metadataBase:new URL(siteUrl),title,applicationName:clubName,description,alternates:{canonical:"/"},icons:{icon:[{url:icon}],shortcut:icon,apple:icon},keywords:["NYU Peru","NYU Perú","NYU Peruvian Student Association","Peruvian students NYU","Peruvian club NYU","Peru NYU","NYU cultural clubs",shortName,clubName],openGraph:{title,description,siteName:clubName,type:"website",url:"/",images:[{url:socialImage,alt:`${clubName} logo`}]},twitter:{card:"summary_large_image",title,description,images:[socialImage]},robots:{index:indexing,follow:indexing},verification:seo.searchConsoleVerification?{google:seo.searchConsoleVerification}:undefined};
}

export default async function RootLayout({children}:{children:React.ReactNode}){
 const data=await readSettings();const config=(data?.cms_config||{}) as any;
 return <html lang="en" className={`${sans.variable} ${display.variable}`}><body><AuthLandingRedirect/><GlobalSiteControls config={config}/>{children}<SiteAnalytics/></body></html>;
}
