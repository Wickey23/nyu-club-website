import type { MetadataRoute } from "next";
import { getLiveSiteContent } from "./lib/liveSiteContent";

const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://nyu-club-website.vercel.app").replace(/\/$/,"");
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const routes=["/","/about","/events","/culture","/community","/team","/gallery","/join"];
  const staticEntries:MetadataRoute.Sitemap=routes.map(route=>({url:`${base}${route}`,lastModified:new Date(),changeFrequency:route==="/events"||route==="/gallery"?"weekly":"monthly",priority:route==="/"?1:route==="/events"?0.9:0.7}));
  try{const site=await getLiveSiteContent();const events:MetadataRoute.Sitemap=site.events.filter(e=>e.status==="published"||e.status==="past").map(e=>({url:`${base}/events/${encodeURIComponent(e.slug||e.id)}`,lastModified:new Date(),changeFrequency:"monthly",priority:e.status==="published"?0.85:0.6}));return[...staticEntries,...events]}catch{return staticEntries}
}
