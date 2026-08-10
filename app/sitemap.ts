import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://nyu-club-website.vercel.app").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/","/about","/events","/culture","/community","/team","/gallery","/join"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/events" || route === "/gallery" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/events" ? 0.9 : 0.7,
  }));
}
