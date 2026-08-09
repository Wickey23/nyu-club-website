import raw from "../../content/site.json";

export type EventItem = {
  id: string; title: string; date: string; time: string; location: string;
  description: string; image: string; rsvpUrl: string; status: string;
};
export type TeamItem = { id: string; name: string; role: string; email: string; image: string };
export type GalleryItem = { id: string; title: string; image: string; description: string; sourceUrl?: string };
export type SiteContent = {
  homepage: {
    headline: string;
    description: string;
    heroImage: string;
    featuredEventId: string;
    videoUrl?: string;
    videoPosterUrl?: string;
    secondaryVideoUrl?: string;
    secondaryVideoPosterUrl?: string;
  };
  events: EventItem[];
  team: TeamItem[];
  gallery: GalleryItem[];
  settings: { clubName: string; shortName: string; email: string; instagram: string; linkedin: string };
};

export const siteContent = raw as SiteContent;
