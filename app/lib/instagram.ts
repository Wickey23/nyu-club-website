export function normalizeInstagramUrl(raw:string){
  const value=(raw||"").trim();
  if(!value)return "";
  try{
    const u=new URL(value);
    if(!/(^|\.)instagram\.com$/i.test(u.hostname))return "";
    u.search="";u.hash="";
    return u.toString().replace(/\/$/,"");
  }catch{return "";}
}

export function instagramEmbedUrl(raw:string){
  const normalized=normalizeInstagramUrl(raw);
  if(!normalized)return "";
  try{
    const u=new URL(normalized);
    const parts=u.pathname.split("/").filter(Boolean);
    if(parts.length<2||!["p","reel","tv"].includes(parts[0]))return "";
    return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed/`;
  }catch{return "";}
}

export function instagramKind(raw:string){
  const normalized=normalizeInstagramUrl(raw);
  if(!normalized)return "Instagram";
  try{
    const first=new URL(normalized).pathname.split("/").filter(Boolean)[0];
    return first==="reel"?"Reel":first==="p"?"Post":first==="tv"?"Video":"Instagram";
  }catch{return "Instagram";}
}
