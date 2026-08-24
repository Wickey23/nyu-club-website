import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(){
 const supabase=await createSupabaseServerClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const{data:profile}=await supabase.from("profiles").select("role,status,email").eq("id",user.id).single();
 if(!profile||profile.status!=="active"||!["super_admin","admin"].includes(profile.role))return NextResponse.json({error:"Unauthorized"},{status:401});
 const [settings,events,team,gallery,audit]=await Promise.all([
  supabase.from("site_settings").select("updated_at").eq("id",1).single(),
  supabase.from("events").select("id",{count:"exact",head:true}),
  supabase.from("team_members").select("id",{count:"exact",head:true}),
  supabase.from("gallery_items").select("id",{count:"exact",head:true}),
  supabase.from("audit_log").select("id,action,entity_type,entity_id,metadata,created_at,actor_id").order("created_at",{ascending:false}).limit(20),
 ]);
 const databaseOk=!settings.error&&!events.error&&!team.error&&!gallery.error;
 return NextResponse.json({
  health:{
   database:databaseOk?"healthy":"error",
   auth:"healthy",
   environment:process.env.VERCEL_ENV||process.env.NODE_ENV||"unknown",
   productionCommit:process.env.VERCEL_GIT_COMMIT_SHA||"local",
   deploymentUrl:process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL||"",
   settingsUpdatedAt:settings.data?.updated_at||null,
   counts:{events:events.count||0,team:team.count||0,media:gallery.count||0}
  },
  activity:audit.data||[]
 });
}
