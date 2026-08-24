import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

async function context(){
 const supabase=await createSupabaseServerClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return{supabase,user:null,profile:null};
 const{data:profile}=await supabase.from("profiles").select("role,status,email").eq("id",user.id).single();
 return{supabase,user,profile};
}

export async function GET(){
 const{supabase,user,profile}=await context();
 if(!user||!profile||profile.status!=="active"||!["super_admin","admin"].includes(profile.role))return NextResponse.json({error:"Unauthorized"},{status:401});
 const{data,error}=await supabase.from("site_settings").select("club_name,short_name,email,instagram,linkedin,facebook,cms_config,updated_at").eq("id",1).single();
 if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({settings:{clubName:data.club_name,shortName:data.short_name,email:data.email,instagram:data.instagram,linkedin:data.linkedin,facebook:data.facebook||"",cmsConfig:data.cms_config||{},updatedAt:data.updated_at}});
}

export async function PUT(request:Request){
 const{supabase,user,profile}=await context();
 if(!user||!profile||profile.status!=="active"||!["super_admin","admin"].includes(profile.role))return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json();
 const payload={club_name:String(body.clubName||""),short_name:String(body.shortName||""),email:String(body.email||""),instagram:String(body.instagram||""),linkedin:String(body.linkedin||""),facebook:String(body.facebook||""),cms_config:body.cmsConfig&&typeof body.cmsConfig==="object"?body.cmsConfig:{},updated_by:user.id};
 const{error}=await supabase.from("site_settings").update(payload).eq("id",1);
 if(error)return NextResponse.json({error:error.message},{status:500});
 await supabase.from("audit_log").insert({actor_id:user.id,action:"settings_update",entity_type:"site_settings",entity_id:"1",metadata:{role:profile.role}});
 return NextResponse.json({ok:true});
}
