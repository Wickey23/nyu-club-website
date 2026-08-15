import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./supabase/config";

export type PublicPageLayout={heroAlign:"left"|"center";contentWidth:"normal"|"wide"|"narrow";sectionSpacing:"compact"|"normal"|"airy"};
export type PublicPageSettings={slug:string;eyebrow:string;title:string;subtitle:string;body:Record<string,string>;layout:PublicPageLayout};

const defaultLayout:PublicPageLayout={heroAlign:"left",contentWidth:"normal",sectionSpacing:"normal"};

export async function getPublicPageSettings(slug:string,defaults:{eyebrow:string;title:string;subtitle:string;body?:Record<string,string>}):Promise<PublicPageSettings>{
 const s=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 try{const{data,error}=await s.from("public_page_settings").select("slug,eyebrow,title,subtitle,body,layout").eq("slug",slug).single();if(error||!data)throw error;
  return{slug,eyebrow:data.eyebrow||defaults.eyebrow,title:data.title||defaults.title,subtitle:data.subtitle||defaults.subtitle,body:{...(defaults.body||{}),...((data.body||{}) as Record<string,string>)},layout:{...defaultLayout,...((data.layout||{}) as Partial<PublicPageLayout>)}};
 }catch{return{slug,eyebrow:defaults.eyebrow,title:defaults.title,subtitle:defaults.subtitle,body:defaults.body||{},layout:defaultLayout}}
}

export function pageCopy(page:PublicPageSettings,key:string,fallback:string){return page.body[key]||fallback;}
