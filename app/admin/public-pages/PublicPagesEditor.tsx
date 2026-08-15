"use client";

import { useEffect,useMemo,useState } from "react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

type Layout={heroAlign:"left"|"center";contentWidth:"normal"|"wide"|"narrow";sectionSpacing:"compact"|"normal"|"airy"};
type PageRow={slug:string;eyebrow:string;title:string;subtitle:string;body:Record<string,string>;layout:Layout};
const pages=[
 {slug:"home",label:"Home",path:"/",fields:["introHeading","introBody","experiencesHeading","joinHeading","joinBody"]},
 {slug:"about",label:"About",path:"/about",fields:["missionHeading","missionBody","historyHeading","historyBody","ctaHeading","ctaBody"]},
 {slug:"events",label:"Events",path:"/events",fields:["upcomingHeading","emptyState","pastHeading"]},
 {slug:"culture",label:"Culture",path:"/culture",fields:["foodHeading","foodBody","musicHeading","musicBody","traditionsHeading","cityHeading","cityBody"]},
 {slug:"community",label:"Community",path:"/community",fields:["introHeading","introBody","networkHeading","networkBody","belongHeading"]},
 {slug:"team",label:"Team",path:"/team",fields:["currentHeading","currentBody","pastHeading","pastBody","emptyState"]},
 {slug:"gallery",label:"Gallery",path:"/gallery",fields:["libraryHeading","libraryBody","archiveHeading","archiveBody","recordHeading","recordBody"]},
 {slug:"join",label:"Join",path:"/join",fields:["introHeading","introBody","stepsHeading","contactHeading","contactBody"]},
] as const;
const labelFor=(k:string)=>k.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase());
const emptyLayout:Layout={heroAlign:"left",contentWidth:"normal",sectionSpacing:"normal"};

export default function PublicPagesEditor(){
 const[rows,setRows]=useState<PageRow[]>([]);const[selected,setSelected]=useState("home");const[message,setMessage]=useState("");const[saving,setSaving]=useState(false);const[loading,setLoading]=useState(true);const[previewKey,setPreviewKey]=useState(0);
 const meta=pages.find(p=>p.slug===selected)!;const row=rows.find(r=>r.slug===selected);
 useEffect(()=>{void(async()=>{const s=createSupabaseBrowserClient();const{data,error}=await s.from("public_page_settings").select("slug,eyebrow,title,subtitle,body,layout").order("slug");if(error)setMessage(error.message);else setRows((data||[]).map((x:any)=>({...x,body:x.body||{},layout:{...emptyLayout,...(x.layout||{})}})));setLoading(false)})()},[]);
 const patch=(p:Partial<PageRow>)=>setRows(v=>v.map(r=>r.slug===selected?{...r,...p}:r));
 const patchBody=(key:string,value:string)=>row&&patch({body:{...row.body,[key]:value}});
 const previewSrc=useMemo(()=>`${meta.path}?cmsPreview=${previewKey}`,[meta.path,previewKey]);
 async function save(){if(!row)return;setSaving(true);setMessage("Saving public page…");const s=createSupabaseBrowserClient();const{error}=await s.from("public_page_settings").update({eyebrow:row.eyebrow,title:row.title,subtitle:row.subtitle,body:row.body,layout:row.layout,updated_at:new Date().toISOString()}).eq("slug",row.slug);setSaving(false);if(error)setMessage(error.message);else{setMessage("Saved. Refreshing live preview…");setPreviewKey(k=>k+1)}}
 if(loading)return <main className="admin-loading">Loading public page editor…</main>;
 return <main className="public-pages-admin"><header className="public-pages-head"><div><span className="admin-kicker">Super Admin only</span><h1>Public Pages</h1><p>Edit the real public-facing copy and page presentation while seeing the actual site beside your controls. Use <b>{"{{brand}}"}</b> anywhere you want the editable Public-facing name inserted automatically.</p></div><div><a href="/admin">← Board CMS</a><button className="admin-primary" onClick={save} disabled={saving}>{saving?"Saving…":"Save & refresh preview"}</button></div></header>{message&&<div className="cms-notice">{message}</div>}
 <div className="public-pages-shell"><aside className="public-pages-controls"><nav className="page-picker">{pages.map(p=><button key={p.slug} className={selected===p.slug?"active":""} onClick={()=>setSelected(p.slug)}>{p.label}</button>)}</nav>{row&&<div className="form-stack"><section className="cms-panel"><span className="admin-kicker">Hero</span><label>Eyebrow<input value={row.eyebrow} onChange={e=>patch({eyebrow:e.target.value})}/></label><label>Title<textarea rows={2} value={row.title} onChange={e=>patch({title:e.target.value})}/></label><label>Subtitle<textarea rows={3} value={row.subtitle} onChange={e=>patch({subtitle:e.target.value})}/></label></section><section className="cms-panel"><span className="admin-kicker">Page copy</span>{meta.fields.map(key=><label key={key}>{labelFor(key)}<textarea rows={key.toLowerCase().includes("body")?5:2} value={row.body[key]||""} placeholder="Leave blank to use the built-in page copy" onChange={e=>patchBody(key,e.target.value)}/></label>)}</section><section className="cms-panel"><span className="admin-kicker">Layout</span><div className="field-grid"><label>Hero alignment<select value={row.layout.heroAlign} onChange={e=>patch({layout:{...row.layout,heroAlign:e.target.value as Layout["heroAlign"]}})}><option value="left">Left</option><option value="center">Centered</option></select></label><label>Content width<select value={row.layout.contentWidth} onChange={e=>patch({layout:{...row.layout,contentWidth:e.target.value as Layout["contentWidth"]}})}><option value="narrow">Narrow</option><option value="normal">Normal</option><option value="wide">Wide</option></select></label><label>Section spacing<select value={row.layout.sectionSpacing} onChange={e=>patch({layout:{...row.layout,sectionSpacing:e.target.value as Layout["sectionSpacing"]}})}><option value="compact">Compact</option><option value="normal">Normal</option><option value="airy">Airy</option></select></label></div></section></div>}</aside><section className="public-pages-preview"><div className="preview-bar"><b>{meta.label} preview</b><a href={meta.path} target="_blank" rel="noreferrer">Open full page ↗</a></div><iframe key={previewKey} src={previewSrc} title={`${meta.label} public page preview`}/></section></div></main>;
}
