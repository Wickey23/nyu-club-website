import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { createSupabaseServerClient } from "./lib/supabase/server";
import SiteAnalytics from "./components/SiteAnalytics";
import "./globals.css";
import "./gallery-extra.css";
import "./home-media.css";
import "./home-responsive.css";
import "./newsletter.css";
import "./phase2.css";

const sans=DM_Sans({subsets:["latin"],variable:"--font-sans",display:"swap"});
const display=Playfair_Display({subsets:["latin"],variable:"--font-display",display:"swap"});
const fallbackClubName="NYU Peruvian Student Association";
const fallbackShortName="NYU Perú";
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://nyu-club-website.vercel.app";
export async function generateMetadata():Promise<Metadata>{let clubName=fallbackClubName,shortName=fallbackShortName;try{const s=await createSupabaseServerClient();const{data}=await s.from("site_settings").select("club_name,short_name").eq("id",1).single();if(data?.club_name?.trim())clubName=data.club_name.trim();if(data?.short_name?.trim())shortName=data.short_name.trim()}catch{}const title=`${shortName} | NYU Peru | ${clubName}`;const description=`${clubName} — NYU's Peruvian student community for culture, events, community, and connection in New York City.`;return{metadataBase:new URL(siteUrl),title,applicationName:shortName,description,alternates:{canonical:"/"},keywords:["NYU Peru","NYU Perú","NYU Peruvian Student Association","Peruvian students NYU","Peruvian club NYU","Peru NYU","NYU cultural clubs",shortName,clubName],openGraph:{title,description,siteName:shortName,type:"website",url:"/",images:[{url:"/nyu-peruvian-logo-v4.svg",alt:`${clubName} logo`}]},twitter:{card:"summary_large_image",title,description,images:["/nyu-peruvian-logo-v4.svg"]},robots:{index:true,follow:true}}}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${display.variable}`}><body>{children}<SiteAnalytics/></body></html>}
