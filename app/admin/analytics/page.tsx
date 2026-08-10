import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export const dynamic="force-dynamic";

function pct(value:number,total:number){return total?`${Math.round((value/total)*100)}%`:"0%";}

export default async function AnalyticsPage(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const {data:profile}=await supabase.from("profiles").select("role,status").eq("id",user.id).single();
  if(!profile||profile.status!=="active"||!["super_admin","admin"].includes(profile.role)) redirect("/admin");

  const since=new Date(Date.now()-30*86400000).toISOString();
  const [eventsResult,subsResult,deliveriesResult,campaignsResult]=await Promise.all([
    supabase.from("site_events").select("event_type,path,session_id,metadata,created_at").gte("created_at",since).order("created_at",{ascending:false}).limit(5000),
    supabase.from("newsletter_subscribers").select("status,created_at,unsubscribed_at"),
    supabase.from("newsletter_deliveries").select("status,opened_at,clicked_at,open_count,click_count,sent_at"),
    supabase.from("newsletter_campaigns").select("id,subject,status,sent_at,created_at").order("created_at",{ascending:false}).limit(12),
  ]);

  const events=eventsResult.data||[];
  const subscribers=subsResult.data||[];
  const deliveries=deliveriesResult.data||[];
  const campaigns=campaignsResult.data||[];
  const views=events.filter(e=>e.event_type==="page_view");
  const clicks=events.filter(e=>e.event_type==="cta_click");
  const sessions=new Set(views.map(e=>e.session_id).filter(Boolean)).size;
  const activeSubs=subscribers.filter(s=>s.status==="subscribed").length;
  const sent=deliveries.filter(d=>d.status==="sent").length;
  const opened=deliveries.filter(d=>d.opened_at).length;
  const clicked=deliveries.filter(d=>d.clicked_at).length;

  const pageCounts=new Map<string,number>();
  for(const view of views) pageCounts.set(view.path,(pageCounts.get(view.path)||0)+1);
  const topPages=[...pageCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
  const ctaCounts=new Map<string,number>();
  for(const click of clicks){const label=String((click.metadata as Record<string,unknown>|null)?.label||"CTA");ctaCounts.set(label,(ctaCounts.get(label)||0)+1);}
  const topCtas=[...ctaCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);

  const card:React.CSSProperties={background:"white",border:"1px solid #ddd5cb",borderRadius:18,padding:22};
  return <main style={{minHeight:"100vh",background:"#f4ede4",padding:"28px 16px 70px",fontFamily:"var(--font-sans)"}}><div style={{maxWidth:1180,margin:"0 auto"}}>
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:24}}><div><span className="admin-kicker">Admin analytics</span><h1 style={{fontFamily:"var(--font-display)",fontSize:"clamp(2.6rem,7vw,4.8rem)",margin:"4px 0"}}>Performance</h1><p style={{margin:0,opacity:.68}}>Website activity for the last 30 days plus newsletter performance.</p></div><a href="/admin" className="admin-primary" style={{textDecoration:"none"}}>← Board CMS</a></header>

    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:18}}>
      <article style={card}><b style={{fontSize:38}}>{views.length}</b><div>Page views · 30d</div></article>
      <article style={card}><b style={{fontSize:38}}>{sessions}</b><div>Sessions · 30d</div></article>
      <article style={card}><b style={{fontSize:38}}>{clicks.length}</b><div>CTA interactions · 30d</div></article>
      <article style={card}><b style={{fontSize:38}}>{activeSubs}</b><div>Active subscribers</div></article>
      <article style={card}><b style={{fontSize:38}}>{pct(opened,sent)}</b><div>Unique email open rate</div></article>
      <article style={card}><b style={{fontSize:38}}>{pct(clicked,sent)}</b><div>Unique email click rate</div></article>
    </section>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      <section style={card}><span className="admin-kicker">Website</span><h2 style={{fontFamily:"var(--font-display)",fontSize:30}}>Top pages</h2>{topPages.length?topPages.map(([path,count])=><div key={path} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #eee"}}><span>{path}</span><b>{count}</b></div>):<p>No page-view data yet. It will populate as visitors browse.</p>}</section>
      <section style={card}><span className="admin-kicker">Interactions</span><h2 style={{fontFamily:"var(--font-display)",fontSize:30}}>Top calls to action</h2>{topCtas.length?topCtas.map(([label,count])=><div key={label} style={{display:"flex",justifyContent:"space-between",gap:12,padding:"10px 0",borderBottom:"1px solid #eee"}}><span>{label}</span><b>{count}</b></div>):<p>No CTA-click data yet.</p>}</section>
      <section style={card}><span className="admin-kicker">Email</span><h2 style={{fontFamily:"var(--font-display)",fontSize:30}}>Delivery overview</h2><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}><div><b style={{fontSize:28}}>{sent}</b><small style={{display:"block"}}>Sent</small></div><div><b style={{fontSize:28}}>{opened}</b><small style={{display:"block"}}>Opened</small></div><div><b style={{fontSize:28}}>{clicked}</b><small style={{display:"block"}}>Clicked</small></div><div><b style={{fontSize:28}}>{deliveries.filter(d=>d.status==="failed").length}</b><small style={{display:"block"}}>Failed</small></div></div></section>
      <section style={card}><span className="admin-kicker">Campaign history</span><h2 style={{fontFamily:"var(--font-display)",fontSize:30}}>Recent campaigns</h2>{campaigns.length?campaigns.map(c=><div key={c.id} style={{padding:"10px 0",borderBottom:"1px solid #eee"}}><b>{c.subject}</b><small style={{display:"block",opacity:.65}}>{c.status}{c.sent_at?` · ${new Date(c.sent_at).toLocaleDateString()}`:""}</small></div>):<p>No campaigns yet.</p>}</section>
    </div>
  </div></main>;
}
