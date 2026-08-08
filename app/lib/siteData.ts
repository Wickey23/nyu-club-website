import raw from "../../content/site.json";

export type SiteEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  rsvpUrl: string;
  status: string;
};

export type SiteTeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  image: string;
};

export type SiteGalleryItem = {
  id: string;
  title: string;
  image: string;
  description: string;
  sourceUrl?: string;
};

export type SiteContent = {
  homepage: {
    headline: string;
    description: string;
    heroImage: string;
    featuredEventId: string;
  };
  events: SiteEvent[];
  team: SiteTeamMember[];
  gallery: SiteGalleryItem[];
  settings: {
    clubName: string;
    shortName: string;
    email: string;
    instagram: string;
    linkedin: string;
  };
};

export const site = raw as SiteContent;
