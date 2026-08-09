import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

function safeName(name: string) {
  const clean = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean || "upload.jpg";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:"Unauthorized" },{ status:401 });

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id",user.id).single();
  if (!profile || profile.status === "disabled" || !["super_admin","admin","media_manager"].includes(profile.role)) {
    return NextResponse.json({ error:"You do not have permission to upload media." },{ status:403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error:"Choose an image to upload." },{ status:400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error:"Only image files are supported." },{ status:400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error:"Images must be 10 MB or smaller." },{ status:400 });

  const filename = `${new Date().toISOString().slice(0,10)}/${Date.now()}-${safeName(file.name)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from("club-media").upload(filename,bytes,{ contentType:file.type,upsert:false });
  if (error) return NextResponse.json({ error:error.message },{ status:400 });
  const { data } = supabase.storage.from("club-media").getPublicUrl(filename);

  await supabase.from("audit_log").insert({ actor_id:user.id,action:"media_upload",entity_type:"storage_object",entity_id:filename,metadata:{ content_type:file.type,size:file.size } });
  return NextResponse.json({ ok:true,url:data.publicUrl,path:filename });
}
