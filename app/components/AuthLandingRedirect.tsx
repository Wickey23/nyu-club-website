"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const INVITE_TYPES=new Set(["invite","signup","magiclink","email"]);

export default function AuthLandingRedirect(){
  const pathname=usePathname();
  useEffect(()=>{
    if(typeof window==="undefined")return;
    if(pathname.startsWith("/admin/activate")||pathname.startsWith("/admin/reset-password"))return;
    const search=new URLSearchParams(window.location.search);
    const hash=new URLSearchParams(window.location.hash.replace(/^#/,""));
    const type=(search.get("type")||hash.get("type")||"").toLowerCase();
    const flow=(search.get("flow")||"").toLowerCase();
    const hasAuthPayload=Boolean(search.get("code")||search.get("token_hash")||hash.get("access_token")||hash.get("refresh_token"));
    let target="";
    if(flow==="recovery"||type==="recovery")target="/admin/reset-password";
    else if(flow==="invite"||INVITE_TYPES.has(type))target="/admin/activate";
    else if(pathname==="/"&&hasAuthPayload)target="/admin/activate";
    if(!target)return;
    const next=`${target}${window.location.search}${window.location.hash}`;
    window.location.replace(next);
  },[pathname]);
  return null;
}
