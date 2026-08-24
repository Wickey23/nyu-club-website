"use client";

import { usePathname } from "next/navigation";

type Config={announcement?:{enabled?:boolean;message?:string;url?:string;expiresAt?:string};website?:{maintenanceMode?:boolean;maintenanceMessage?:string};branding?:{primaryLogo?:string}};
export default function GlobalSiteControls({config}:{config:Config}){
 const path=usePathname();
 if(path.startsWith("/admin")||path.startsWith("/auth"))return null;
 const maintenance=Boolean(config.website?.maintenanceMode);
 const expires=config.announcement?.expiresAt?new Date(config.announcement.expiresAt).getTime():0;
 const announcement=Boolean(config.announcement?.enabled&&config.announcement?.message&&(!expires||expires>Date.now()));
 if(maintenance)return <div className="site-maintenance"><img src={config.branding?.primaryLogo||"/nyu-peruvian-logo-v4.svg"} alt=""/><span>NYU Perú</span><h1>We’ll be back soon.</h1><p>{config.website?.maintenanceMessage||"The site is temporarily unavailable while we make an update."}</p></div>;
 if(!announcement)return null;
 const inner=<><span>{config.announcement?.message}</span>{config.announcement?.url&&<b>Learn more →</b>}</>;
 return config.announcement?.url?<a className="site-announcement" href={config.announcement.url}>{inner}</a>:<div className="site-announcement">{inner}</div>;
}
