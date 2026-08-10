"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const SESSION_KEY = "nyu_peru_site_session";

function sessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const value = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, value);
    return value;
  } catch {
    return null;
  }
}

async function track(eventType: "page_view" | "cta_click", path: string, metadata: Record<string, unknown> = {}) {
  try {
    const supabase = createSupabaseBrowserClient();
    await supabase.rpc("track_site_event", {
      p_event_type: eventType,
      p_path: path,
      p_referrer: document.referrer || "",
      p_session_id: sessionId(),
      p_metadata: metadata,
    });
  } catch {
    // Analytics must never interfere with navigation or form usage.
  }
}

export default function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    void track("page_view", pathname);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (location.pathname.startsWith("/admin")) return;
      const target = event.target instanceof Element ? event.target.closest("a,button") : null;
      if (!target) return;
      const element = target as HTMLAnchorElement | HTMLButtonElement;
      const isCta = element.classList.contains("btn") || element.hasAttribute("data-track") || element.classList.contains("text-link");
      if (!isCta) return;
      const label = (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 160);
      const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
      void track("cta_click", location.pathname, { label, href });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
