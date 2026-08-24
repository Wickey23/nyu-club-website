"use client";

import { useMemo, useState } from "react";
import { galleryImageUrl, galleryVideoEmbedUrl, isGoogleDriveUrl } from "../lib/mediaUrl";
import type { GalleryItem } from "../lib/siteContent";

type Props={items:GalleryItem[];eventTitles:Record<string,string>;options?:{showCaptions?:boolean;showDates?:boolean;allowVideo?:boolean}};
export default function GalleryBrowser({items,eventTitles,options={}}:Props){
  const usable=options.allowVideo===false?items.filter(i=>(i.mediaType||"image")!=="video"):items;
  const years=useMemo(()=>[...new Set(usable.map(i=>i.year||Number(i.createdAt?.slice(0,4))).filter(Boolean) as number[])].sort((a,b)=>b-a),[usable]);
  const albums=useMemo(()=>[...new Set(usable.map(i=>i.album).filter(Boolean) as string[])].sort(),[usable]);
  const [type,setType]=useState("all");const [year,setYear]=useState("all");const [album,setAlbum]=useState("all");
  const filtered=usable.filter(i=>(type==="all"||(i.mediaType||"image")===type)&&(year==="all"||String(i.year||i.createdAt?.slice(0,4))===year)&&(album==="all"||i.album===album));
  return <><div className="gallery-filterbar"><label>Media<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All media</option><option value="image">Photos</option>{options.allowVideo!==false&&<option value="video">Videos</option>}</select></label><label>Year<select value={year} onChange={e=>setYear(e.target.value)}><option value="all">All years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></label><label>Album<select value={album} onChange={e=>setAlbum(e.target.value)}><option value="all">All albums</option>{albums.map(a=><option key={a} value={a}>{a}</option>)}</select></label><span>{filtered.length} item{filtered.length===1?"":"s"}</span></div><div className="media-library-grid">{filtered.map(item=>{const video=item.mediaType==="video";const url=video?galleryVideoEmbedUrl(item.image):galleryImageUrl(item.image);return <article key={item.id} className={item.featured?"featured":""}><div className="media-library-frame">{video?(isGoogleDriveUrl(item.image)?<iframe src={url} title={item.title} allow="autoplay; fullscreen" allowFullScreen/>:<video src={url} controls playsInline preload="metadata"/>):<img src={url} alt={item.title}/>}</div><div className="media-library-copy"><div className="media-tags">{item.featured&&<span>Featured</span>}{item.album&&<span>{item.album}</span>}{options.showDates!==false&&item.year&&<span>{item.year}</span>}</div><h3>{item.title}</h3>{options.showCaptions!==false&&item.description&&<p>{item.description}</p>}{item.eventId&&eventTitles[item.eventId]&&<a href={`/events/${item.eventId}`}>Related event: {eventTitles[item.eventId]} →</a>}{item.sourceUrl&&<a href={item.sourceUrl} target="_blank" rel="noreferrer">Original source ↗</a>}</div></article>})}</div>{!filtered.length&&<p className="empty-state">No media matches those filters.</p>}</>;
}
