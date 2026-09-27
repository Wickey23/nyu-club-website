import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export const dynamic="force-dynamic";
const FALLBACK="/nyu-peruvian-logo-v4.svg";

export async function GET(request:Request){
  try{
    const supabase=await createSupabaseServerClient();
    const{data}=await supabase.from("site_settings").select("cms_config").eq("id",1).single();
    const cfg=(data?.cms_config&&typeof data.cms_config==="object"?data.cms_config:{}) as any;
    const requested=new URL(request.url).searchParams.get("variant");
    const branding=cfg.branding||{};
    const logo=(requested==="light"?branding.lightLogo:branding.primaryLogo)||branding.primaryLogo||FALLBACK;
    return NextResponse.redirect(new URL(logo,request.url),307);
  }catch{
    return NextResponse.redirect(new URL(FALLBACK,request.url),307);
  }
}
