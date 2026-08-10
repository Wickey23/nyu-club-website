"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

const legacyNames = [
  "¡Viva Perú!",
  "¡VIVA PERÚ!",
  "Viva Perú!",
  "VIVA PERÚ!",
  "Viva Perú",
  "VIVA PERÚ",
];

function replaceLegacyName(value: string, publicName: string) {
  return legacyNames.reduce((next, legacy) => next.split(legacy).join(publicName), value);
}

function syncNode(root: ParentNode, publicName: string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const current = node.nodeValue || "";
    const next = replaceLegacyName(current, publicName);
    if (next !== current) node.nodeValue = next;
    node = walker.nextNode();
  }

  root.querySelectorAll?.("[aria-label],[title],[alt],[placeholder]").forEach((element) => {
    for (const attribute of ["aria-label", "title", "alt", "placeholder"]) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      const next = replaceLegacyName(current, publicName);
      if (next !== current) element.setAttribute(attribute, next);
    }
  });
}

export default function PublicNameSync() {
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let cancelled = false;

    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("site_settings")
        .select("short_name,club_name")
        .eq("id", 1)
        .single();

      if (cancelled) return;
      const publicName = data?.short_name?.trim() || data?.club_name?.trim() || "NYU Peru";
      document.documentElement.dataset.publicName = publicName;
      syncNode(document.body, publicName);

      observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData" && mutation.target.parentNode) {
            const current = mutation.target.nodeValue || "";
            const next = replaceLegacyName(current, publicName);
            if (next !== current) mutation.target.nodeValue = next;
          }
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const current = node.nodeValue || "";
              const next = replaceLegacyName(current, publicName);
              if (next !== current) node.nodeValue = next;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              syncNode(node as ParentNode, publicName);
            }
          });
        }
      });

      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
