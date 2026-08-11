import { createSupabaseServerClient } from "../lib/supabase/server";
import { instagramEmbedUrl, instagramKind } from "../lib/instagram";

export default async function InstagramSection(){
  const supabase=await createSupabaseServerClient();
  const[{data:posts},{data:settings}]=await Promise.all([
    supabase.from("instagram_posts").select("id,instagram_url,caption,cover_image,featured,sort_order").eq("published",true).order("featured",{ascending:false}).order("sort_order").order("created_at",{ascending:false}).limit(6),
    supabase.from("site_settings").select("instagram,short_name,club_name").eq("id",1).single(),
  ]);
  if(!posts?.length)return null;
  const profile=settings?.instagram||"https://www.instagram.com/perunyu/";const brand=settings?.short_name||settings?.club_name||"NYU Perú";
  return <section className="page-section instagram-site-section"><div className="wrap"><div className="section-title"><div><span className="kicker">From Instagram</span><h2>See what {brand} is sharing.</h2></div><a className="btn outline" href={profile} target="_blank" rel="noreferrer">Follow on Instagram ↗</a></div><div className="instagram-site-grid">{posts.map(p=>{const embed=instagramEmbedUrl(p.instagram_url);return <article key={p.id} className={p.featured?"featured":""}>{p.cover_image?<a href={p.instagram_url} target="_blank" rel="noreferrer"><img src={p.cover_image} alt={p.caption||`Instagram ${instagramKind(p.instagram_url)}`}/></a>:embed?<iframe src={embed} title={p.caption||`Instagram ${instagramKind(p.instagram_url)}`} loading="lazy" allowTransparency/>:null}<div><span className="kicker">{instagramKind(p.instagram_url)}</span>{p.caption&&<p>{p.caption}</p>}<a href={p.instagram_url} target="_blank" rel="noreferrer">View on Instagram ↗</a></div></article>})}</div></div></section>;
}
