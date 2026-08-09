import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type EventItem = { id:string; title:string; date:string; time:string; location:string; description:string; image:string; rsvpUrl:string; status:string };
type TeamItem = { id:string; name:string; role:string; email:string; image:string };
type GalleryItem = { id:string; title:string; image:string; description:string; sourceUrl?:string; mediaType?:"image"|"video"; createdAt?:string };
type SiteContent = {
  homepage:{ headline:string; description:string; heroImage:string; featuredEventId:string; videoUrl?:string; videoPosterUrl?:string; secondaryVideoUrl?:string; secondaryVideoPosterUrl?:string };
  events:EventItem[];
  team:TeamItem[];
  gallery:GalleryItem[];
  settings:{ clubName:string; shortName:string; email:string; instagram:string; linkedin:string };
};

async function adminContext() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user:null, profile:null };
  const { data: profile } = await supabase.from("profiles").select("email,role,status").eq("id", user.id).single();
  return { supabase, user, profile };
}

async function loadContent(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>): Promise<SiteContent> {
  const [homeResult,eventResult,teamResult,galleryResult,settingsResult] = await Promise.all([
    supabase.from("homepage_content").select("headline,description,hero_image,featured_event_id,video_url,video_poster_url,secondary_video_url,secondary_video_poster_url").eq("id",1).single(),
    supabase.from("events").select("id,title,event_date,start_time,location,description,image_url,rsvp_url,status").order("event_date",{ascending:false,nullsFirst:false}),
    supabase.from("team_members").select("id,name,title,email,image_url,sort_order").order("sort_order",{ascending:true}),
    supabase.from("gallery_items").select("id,title,image_url,caption,source_url,media_type,sort_order,created_at").order("sort_order",{ascending:true}),
    supabase.from("site_settings").select("club_name,short_name,email,instagram,linkedin").eq("id",1).single(),
  ]);

  const firstError = homeResult.error || eventResult.error || teamResult.error || galleryResult.error || settingsResult.error;
  if (firstError) throw firstError;
  const home = homeResult.data!;
  const settings = settingsResult.data!;
  return {
    homepage:{
      headline:home.headline,
      description:home.description,
      heroImage:home.hero_image,
      featuredEventId:home.featured_event_id || "",
      videoUrl:home.video_url || "",
      videoPosterUrl:home.video_poster_url || "",
      secondaryVideoUrl:home.secondary_video_url || "",
      secondaryVideoPosterUrl:home.secondary_video_poster_url || "",
    },
    events:(eventResult.data||[]).map((item)=>({
      id:item.id,
      title:item.title,
      date:item.event_date || "",
      time:item.start_time ? String(item.start_time).slice(0,5) : "",
      location:item.location,
      description:item.description,
      image:item.image_url,
      rsvpUrl:item.rsvp_url,
      status:item.status,
    })),
    team:(teamResult.data||[]).map((item)=>({ id:item.id,name:item.name,role:item.title,email:item.email,image:item.image_url })),
    gallery:(galleryResult.data||[]).map((item)=>({ id:item.id,title:item.title,image:item.image_url,description:item.caption,sourceUrl:item.source_url,mediaType:(item.media_type||"image") as "image"|"video",createdAt:item.created_at })),
    settings:{ clubName:settings.club_name,shortName:settings.short_name,email:settings.email,instagram:settings.instagram,linkedin:settings.linkedin },
  };
}

export async function GET() {
  const { supabase, user, profile } = await adminContext();
  if (!user || !profile || profile.status === "disabled") return NextResponse.json({ error:"Unauthorized" },{ status:401 });
  try {
    const content = await loadContent(supabase);
    return NextResponse.json({ content, admin:profile.email, role:profile.role });
  } catch (error) {
    return NextResponse.json({ error:error instanceof Error ? error.message : "Unable to load CMS content" },{ status:500 });
  }
}

async function reconcileEvents(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, items:EventItem[], userId:string) {
  const { data: existing } = await supabase.from("events").select("id");
  const keep = new Set<string>();
  const idMap = new Map<string,string>();
  for (const item of items) {
    const payload = {
      title:item.title || "Untitled event",
      event_date:item.date || null,
      start_time:item.time || null,
      location:item.location || "NYU · New York",
      description:item.description || "",
      image_url:item.image || "",
      rsvp_url:item.rsvpUrl || "",
      status:["draft","published","past"].includes(item.status) ? item.status : "draft",
      updated_by:userId,
    };
    if (uuidPattern.test(item.id)) {
      const { error } = await supabase.from("events").update(payload).eq("id",item.id);
      if (error) throw error;
      keep.add(item.id); idMap.set(item.id,item.id);
    } else {
      const { data, error } = await supabase.from("events").insert({ ...payload, created_by:userId }).select("id").single();
      if (error) throw error;
      keep.add(data.id); idMap.set(item.id,data.id);
    }
  }
  for (const row of existing||[]) if (!keep.has(row.id)) {
    const { error } = await supabase.from("events").delete().eq("id",row.id);
    if (error) throw error;
  }
  return idMap;
}

async function reconcileTeam(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, items:TeamItem[]) {
  const { data: existing } = await supabase.from("team_members").select("id");
  const keep = new Set<string>();
  for (const [index,item] of items.entries()) {
    const payload = { name:item.name || "Board Member",title:item.role || "Board Member",email:item.email || "",image_url:item.image || "",sort_order:index,active:true };
    if (uuidPattern.test(item.id)) {
      const { error } = await supabase.from("team_members").update(payload).eq("id",item.id); if (error) throw error; keep.add(item.id);
    } else {
      const { data,error } = await supabase.from("team_members").insert(payload).select("id").single(); if (error) throw error; keep.add(data.id);
    }
  }
  for (const row of existing||[]) if (!keep.has(row.id)) { const {error}=await supabase.from("team_members").delete().eq("id",row.id); if(error) throw error; }
}

async function reconcileGallery(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, items:GalleryItem[], userId:string) {
  const { data: existing } = await supabase.from("gallery_items").select("id");
  const keep = new Set<string>();
  for (const [index,item] of items.entries()) {
    const payload = {
      title:item.title || "Gallery media",
      image_url:item.image,
      caption:item.description || "",
      source_url:item.sourceUrl || "",
      media_type:item.mediaType === "video" ? "video" : "image",
      sort_order:index,
      published:true,
    };
    if (!item.image) continue;
    if (uuidPattern.test(item.id)) {
      const { error } = await supabase.from("gallery_items").update(payload).eq("id",item.id); if (error) throw error; keep.add(item.id);
    } else {
      const { data,error } = await supabase.from("gallery_items").insert({ ...payload,created_by:userId }).select("id").single(); if (error) throw error; keep.add(data.id);
    }
  }
  for (const row of existing||[]) if (!keep.has(row.id)) { const {error}=await supabase.from("gallery_items").delete().eq("id",row.id); if(error) throw error; }
}

export async function PUT(request: Request) {
  const { supabase, user, profile } = await adminContext();
  if (!user || !profile || profile.status === "disabled") return NextResponse.json({ error:"Unauthorized" },{ status:401 });
  const content = await request.json() as SiteContent;
  try {
    const role = profile.role;
    let eventIdMap = new Map<string,string>();
    if (["super_admin","admin","events_manager"].includes(role)) eventIdMap = await reconcileEvents(supabase,content.events,user.id);
    if (["super_admin","admin","team_manager"].includes(role)) await reconcileTeam(supabase,content.team);
    if (["super_admin","admin","media_manager"].includes(role)) await reconcileGallery(supabase,content.gallery,user.id);

    if (["super_admin","admin"].includes(role)) {
      const featured = content.homepage.featuredEventId ? (eventIdMap.get(content.homepage.featuredEventId) || (uuidPattern.test(content.homepage.featuredEventId) ? content.homepage.featuredEventId : null)) : null;
      const { error:homeError } = await supabase.from("homepage_content").update({
        headline:content.homepage.headline,
        description:content.homepage.description,
        hero_image:content.homepage.heroImage,
        featured_event_id:featured,
        video_url:content.homepage.videoUrl || "",
        video_poster_url:content.homepage.videoPosterUrl || "",
        secondary_video_url:content.homepage.secondaryVideoUrl || "",
        secondary_video_poster_url:content.homepage.secondaryVideoPosterUrl || "",
        updated_by:user.id,
      }).eq("id",1);
      if (homeError) throw homeError;
      const { error:settingsError } = await supabase.from("site_settings").update({ club_name:content.settings.clubName,short_name:content.settings.shortName,email:content.settings.email,instagram:content.settings.instagram,linkedin:content.settings.linkedin,updated_by:user.id }).eq("id",1);
      if (settingsError) throw settingsError;
    }

    await supabase.from("audit_log").insert({ actor_id:user.id,action:"cms_save",entity_type:"site_content",metadata:{ role } });
    return NextResponse.json({ ok:true });
  } catch (error) {
    return NextResponse.json({ error:error instanceof Error ? error.message : "Unable to save CMS content" },{ status:500 });
  }
}
