import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedRoles=["super_admin","admin","events_manager"];
async function context(){const supabase=await createSupabaseServerClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return{supabase,user:null,profile:null};const{data:profile}=await supabase.from("profiles").select("role,status,email").eq("id",user.id).single();return{supabase,user,profile};}

export async function GET(){const{supabase,user,profile}=await context();if(!user||!profile||profile.status!=="active"||!allowedRoles.includes(profile.role))return NextResponse.json({error:"Unauthorized"},{status:401});const{data,error}=await supabase.from("events").select("id,title,status,event_date,approval_status,approval_note,approved_at,publish_at,unpublish_at,updated_at").order("event_date",{ascending:false,nullsFirst:false});if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({events:data||[],role:profile.role});}

export async function PUT(request:Request){const{supabase,user,profile}=await context();if(!user||!profile||profile.status!=="active"||!allowedRoles.includes(profile.role))return NextResponse.json({error:"Unauthorized"},{status:401});const body=await request.json().catch(()=>({}));const id=String(body.id||"");const action=String(body.action||"");if(!uuid.test(id))return NextResponse.json({error:"Invalid event"},{status:400});const reviewer=profile.role==="super_admin"||profile.role==="admin";const note=String(body.note||"").slice(0,2000);const publishAt=body.publishAt?new Date(String(body.publishAt)).toISOString():null;const unpublishAt=body.unpublishAt?new Date(String(body.unpublishAt)).toISOString():null;try{
 let patch:Record<string,unknown>={};
 if(action==="save_schedule")patch={publish_at:publishAt,unpublish_at:unpublishAt,approval_note:note};
 else if(action==="submit_review")patch={approval_status:"review",approval_note:note,approved_by:null,approved_at:null};
 else if(action==="cancel_schedule")patch={publish_at:null,unpublish_at:null};
 else if(action==="approve"){if(!reviewer)return NextResponse.json({error:"Admin approval required"},{status:403});patch={approval_status:"approved",approval_note:note,approved_by:user.id,approved_at:new Date().toISOString(),publish_at:publishAt,unpublish_at:unpublishAt};}
 else if(action==="request_changes"){if(!reviewer)return NextResponse.json({error:"Admin approval required"},{status:403});patch={approval_status:"changes_requested",approval_note:note,approved_by:null,approved_at:null};}
 else if(action==="publish_now"){if(!reviewer)return NextResponse.json({error:"Admin approval required"},{status:403});patch={status:"published",approval_status:"approved",approval_note:note,approved_by:user.id,approved_at:new Date().toISOString(),publish_at:null,unpublish_at:unpublishAt};}
 else if(action==="return_to_draft"){if(!reviewer)return NextResponse.json({error:"Admin approval required"},{status:403});patch={status:"draft",approval_status:"draft",approval_note:note,approved_by:null,approved_at:null,publish_at:null};}
 else return NextResponse.json({error:"Unknown action"},{status:400});
 const{error}=await supabase.from("events").update(patch).eq("id",id);if(error)throw error;await supabase.from("audit_log").insert({actor_id:user.id,action:`publishing_${action}`,entity_type:"event",entity_id:id,metadata:{note,publishAt,unpublishAt}});return NextResponse.json({ok:true});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Unable to update publishing workflow"},{status:500});}
}
