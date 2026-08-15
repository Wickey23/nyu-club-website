"use client";

import { useEffect, useMemo, useState } from "react";

type Slide = { image:string; title:string; description?:string };

type Props = {
  slides: Slide[];
  brand:string;
  primaryVideoUrl?: string;
  primaryPosterUrl?: string;
  secondaryVideoUrl?: string;
  secondaryPosterUrl?: string;
};

function VideoSlot({src,poster,label,title,copy}:{src?:string;poster?:string;label:string;title:string;copy:string}){
  if(src){
    return <div className="home-video-frame">
      <video controls playsInline preload="metadata" poster={poster || undefined}>
        <source src={src}/>
        Your browser does not support embedded video.
      </video>
    </div>;
  }
  return <div className="home-video-placeholder" style={poster?{backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.68),rgba(0,0,0,.14)),url(${poster})`}:undefined}>
    <div className="home-video-play" aria-hidden="true">▶</div>
    <div className="home-video-placeholder-copy"><span className="kicker light">{label}</span><h3>{title}</h3><p>{copy}</p></div>
  </div>;
}

export default function HomeMediaShowcase({slides,brand,primaryVideoUrl,primaryPosterUrl,secondaryVideoUrl,secondaryPosterUrl}:Props){
  const usableSlides = useMemo(()=>slides.filter(slide=>slide.image),[slides]);
  const [index,setIndex] = useState(0);
  const [paused,setPaused] = useState(false);

  useEffect(()=>{
    if(paused || usableSlides.length < 2) return;
    const timer = window.setInterval(()=>setIndex(current=>(current+1)%usableSlides.length),5000);
    return ()=>window.clearInterval(timer);
  },[paused,usableSlides.length]);

  useEffect(()=>{
    if(index >= usableSlides.length) setIndex(0);
  },[index,usableSlides.length]);

  const current = usableSlides[index];
  const publicBrand=brand||"NYU Perú";

  return <>
    <section className="media-showcase-section">
      <div className="wrap media-showcase-head">
        <div><span className="kicker light">See the community</span><h2>Peru at NYU, in motion.</h2></div>
        <p>Events, performances, conversations, food, friendships and the moments between them.</p>
      </div>
      <div className="wrap media-video-grid">
        <div className="media-video-primary">
          <VideoSlot src={primaryVideoUrl} poster={primaryPosterUrl} label="Club reel" title={`A year with ${publicBrand}`} copy="Club reels, event recaps and social video highlights can be managed from the homepage editor."/>
        </div>
        <div className="media-video-copy">
          <span className="kicker light">Stories worth sharing</span>
          <h3>Culture feels different when you experience it together.</h3>
          <p>Use this space for a short event recap, member story, artist conversation or behind-the-scenes video from the club.</p>
          <VideoSlot src={secondaryVideoUrl} poster={secondaryPosterUrl} label="Featured story" title="Member story / event recap" copy="A second video slot is ready for the board to update."/>
        </div>
      </div>
    </section>

    {current && <section className="home-carousel-section" aria-label="Community photo carousel">
      <div className="wrap home-carousel-head"><div><span className="kicker">Community gallery</span><h2>One moment at a time.</h2></div><a href="/gallery" className="text-link">Open full gallery →</a></div>
      <div className="wrap home-carousel-shell" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
        <div className="home-carousel-image-wrap">
          {usableSlides.map((slide,i)=><img key={`${slide.image}-${i}`} className={`home-carousel-image ${i===index?"active":""}`} src={slide.image} alt={slide.title || "NYU Peruvian Student Association community"}/>) }
          <div className="home-carousel-gradient"/>
          <div className="home-carousel-caption"><span>{String(index+1).padStart(2,"0")} / {String(usableSlides.length).padStart(2,"0")}</span><h3>{current.title}</h3>{current.description&&<p>{current.description}</p>}</div>
          {usableSlides.length>1&&<div className="home-carousel-controls">
            <button aria-label="Previous photo" onClick={()=>setIndex(currentIndex=>(currentIndex-1+usableSlides.length)%usableSlides.length)}>←</button>
            <button aria-label="Next photo" onClick={()=>setIndex(currentIndex=>(currentIndex+1)%usableSlides.length)}>→</button>
          </div>}
        </div>
        {usableSlides.length>1&&<div className="home-carousel-dots" aria-label="Choose photo">{usableSlides.map((slide,i)=><button key={`${slide.image}-dot-${i}`} className={i===index?"active":""} aria-label={`Show photo ${i+1}`} onClick={()=>setIndex(i)}/>)}</div>}
      </div>
    </section>}
  </>;
}
