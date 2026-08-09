import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase/config";
import { siteContent as fallback, type SiteContent } from "./siteContent";

export async function getLiveSiteContent(): Promise<SiteContent> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth:{ persistSession:false,autoRefreshToken:false } });
  try {
    const [homeResult,eventResult,teamResult,galleryResult,settingsResult] = await Promise.all([
      supabase.from("homepage_content").select("headline,description,hero_image,featured_event_id").eq("id",1).single(),
      supabase.from("events").select("id,title,event_date,start_time,location,description,image_url,rsvp_url,status").in("status",["published","past"]).order("event_date",{ascending:false,nullsFirst:false}),
      supabase.from("team_members").select("id,name,title,email,image_url,sort_order").eq("active",true).order("sort_order",{ascending:true}),
      supabase.from("gallery_items").select("id,title,image_url,caption,source_url,sort_order").eq("published",true).order("sort_order",{ascending:true}),
      supabase.from("site_settings").select("club_name,short_name,email,instagram,linkedin").eq("id",1).single(),
    ]);

    const error = homeResult.error || eventResult.error || teamResult.error || galleryResult.error || settingsResult.error;
    if (error) throw error;
    const home=homeResult.data!;
    const settings=settingsResult.data!;
    return {
      homepage:{ headline:home.headline,description:home.description,heroImage:home.hero_image,featuredEventId:home.featured_event_id||"" },
      events:(eventResult.data||[]).map(item=>({ id:item.id,title:item.title,date:item.event_date||"",time:item.start_time?String(item.start_time).slice(0,5):"",location:item.location,description:item.description,image:item.image_url,rsvpUrl:item.rsvp_url,status:item.status })),
      team:(teamResult.data||[]).map(item=>({ id:item.id,name:item.name,role:item.title,email:item.email,image:item.image_url })),
      gallery:(galleryResult.data||[]).map(item=>({ id:item.id,title:item.title,image:item.image_url,description:item.caption,sourceUrl:item.source_url })),
      settings:{ clubName:settings.club_name,shortName:settings.short_name,email:settings.email,instagram:settings.instagram,linkedin:settings.linkedin },
    };
  } catch {
    return {
      ...fallback,
      events:fallback.events.filter(item=>item.status==="published"||item.status==="past"),
    };
  }
}
