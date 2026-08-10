import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase/config";
import { siteContent as fallback, type SiteContent } from "./siteContent";

export async function getLiveSiteContent(): Promise<SiteContent> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth:{ persistSession:false,autoRefreshToken:false } });
  try {
    const [homeResult,eventResult,teamResult,galleryResult,settingsResult] = await Promise.all([
      supabase.from("homepage_content").select("headline,description,hero_image,featured_event_id,video_url,video_poster_url,secondary_video_url,secondary_video_poster_url").eq("id",1).single(),
      supabase.from("events").select("id,title,slug,event_date,start_time,end_time,location,description,details,image_url,rsvp_url,status,schedule,faq").in("status",["published","past"]).order("event_date",{ascending:false,nullsFirst:false}),
      supabase.from("team_members").select("id,name,title,bio,email,image_url,board_year,sort_order,active").order("active",{ascending:false}).order("board_year",{ascending:false,nullsFirst:false}).order("sort_order",{ascending:true}),
      supabase.from("gallery_items").select("id,title,image_url,caption,source_url,media_type,sort_order,created_at,year,album,tags,featured,event_id").eq("published",true).order("featured",{ascending:false}).order("sort_order",{ascending:true}),
      supabase.from("site_settings").select("club_name,short_name,email,instagram,linkedin").eq("id",1).single(),
    ]);

    const error = homeResult.error || eventResult.error || teamResult.error || galleryResult.error || settingsResult.error;
    if (error) throw error;
    const home=homeResult.data!;
    const settings=settingsResult.data!;
    return {
      homepage:{
        headline:home.headline,
        description:home.description,
        heroImage:home.hero_image,
        featuredEventId:home.featured_event_id||"",
        videoUrl:home.video_url||"",
        videoPosterUrl:home.video_poster_url||"",
        secondaryVideoUrl:home.secondary_video_url||"",
        secondaryVideoPosterUrl:home.secondary_video_poster_url||"",
      },
      events:(eventResult.data||[]).map(item=>({
        id:item.id,title:item.title,slug:item.slug||"",date:item.event_date||"",time:item.start_time?String(item.start_time).slice(0,5):"",endTime:item.end_time?String(item.end_time).slice(0,5):"",location:item.location,description:item.description,details:item.details||"",image:item.image_url,rsvpUrl:item.rsvp_url,status:item.status,schedule:Array.isArray(item.schedule)?item.schedule:[],faq:Array.isArray(item.faq)?item.faq:[]
      })),
      team:(teamResult.data||[]).map(item=>({ id:item.id,name:item.name,role:item.title,email:item.email,image:item.image_url,bio:item.bio||"",boardYear:item.board_year||"",active:item.active })),
      gallery:(galleryResult.data||[]).map(item=>({ id:item.id,title:item.title,image:item.image_url,description:item.caption,sourceUrl:item.source_url,mediaType:(item.media_type||"image") as "image"|"video",createdAt:item.created_at,year:item.year||undefined,album:item.album||"",tags:item.tags||[],featured:Boolean(item.featured),eventId:item.event_id||"" })),
      settings:{ clubName:settings.club_name,shortName:settings.short_name,email:settings.email,instagram:settings.instagram,linkedin:settings.linkedin },
    };
  } catch {
    return {
      ...fallback,
      homepage:{
        ...fallback.homepage,
        videoUrl:fallback.homepage.videoUrl||"",
        videoPosterUrl:fallback.homepage.videoPosterUrl||"",
        secondaryVideoUrl:fallback.homepage.secondaryVideoUrl||"",
        secondaryVideoPosterUrl:fallback.homepage.secondaryVideoPosterUrl||"",
      },
      events:fallback.events.filter(item=>item.status==="published"||item.status==="past"),
    };
  }
}
