"use client";

import { useMemo,useState } from "react";

type Member={id:string;name:string;role:string;email:string;image:string;bio?:string;boardYear?:string;active?:boolean};
type Options={currentYear?:string;showEmails?:boolean;showBios?:boolean;hideEmptyYears?:boolean};
const photo=(src:string)=>({backgroundImage:`url(${src})`,backgroundSize:"cover",backgroundPosition:"center top",backgroundRepeat:"no-repeat"});

export default function TeamYearFilter({members,options}:{members:Member[];options?:Options}){
  const currentYear=options?.currentYear||"2026–2027";
  const current=members.filter(m=>m.active!==false);
  const archived=members.filter(m=>m.active===false);
  const years=useMemo(()=>[...new Set(archived.map(m=>m.boardYear).filter(Boolean) as string[])].sort().reverse(),[archived]);
  const [selected,setSelected]=useState("current");
  const visible=selected==="current"?current:archived.filter(m=>m.boardYear===selected);
  const label=selected==="current"?`${currentYear} (Current)`:selected;
  return <>
    <div className="team-year-toolbar">
      <label htmlFor="team-year-select">Board year</label>
      <select id="team-year-select" value={selected} onChange={e=>setSelected(e.target.value)}>
        <option value="current">{currentYear} (Current)</option>
        {years.map(year=><option key={year} value={year}>{year}</option>)}
      </select>
      <span>{visible.length} member{visible.length===1?"":"s"}</span>
    </div>
    <div className="team-year-heading"><span className="kicker">{label}</span></div>
    <div className="team-grid">{visible.map(member=><article key={member.id}><div className="portrait" style={member.image?photo(member.image):undefined}/><h3>{member.name}</h3><p>{member.role}</p>{options?.showBios!==false&&member.bio&&<p className="team-bio">{member.bio}</p>}{options?.showEmails!==false&&member.email&&<a href={`mailto:${member.email}`}>{member.email}</a>}</article>)}</div>
    {!visible.length&&options?.hideEmptyYears!==true&&<div className="event-empty"><h2>No board members listed for this year yet.</h2><p>Add archived board members and their board year in Admin to populate this view.</p></div>}
  </>;
}
