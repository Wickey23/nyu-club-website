import raw from "../../content/site.json";

export type EventScheduleItem = { time: string; label: string };
export type EventFaqItem = { question: string; answer: string };
export type EventItem = {
  id: string; title: string; slug?: string; date: string; time: string; endTime?: string; location: string;
  description: string; details?: string; image: string; rsvpUrl: string; status: string;
  schedule?: EventScheduleItem[]; faq?: EventFaqItem[];
};
export type TeamItem = { id: string; name: string; role: string; email: string; image: string; bio?: string; boardYear?: string; active?: boolean };
export type GalleryItem = {
  id: string; title: string; image: string; description: string; sourceUrl?: string; mediaType?: "image"|"video";
  createdAt?: string; year?: number; album?: string; tags?: string[]; featured?: boolean; eventId?: string;
};
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
  settings: { clubName: string; shortName: string; email: string; instagram: string; linkedin: string; facebook: string };
};

export const siteContent = raw as SiteContent;
