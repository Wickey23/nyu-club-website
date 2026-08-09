import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { createSupabaseServerClient } from "./lib/supabase/server";
import "./globals.css";
import "./gallery-extra.css";
import "./home-media.css";
import "./home-responsive.css";
import "./newsletter.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fallbackClubName = "NYU Peruvian Student Association";
const fallbackShortName = "¡Viva Perú!";

export async function generateMetadata(): Promise<Metadata> {
  let clubName = fallbackClubName;
  let shortName = fallbackShortName;

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("club_name,short_name")
      .eq("id", 1)
      .single();

    if (data?.club_name?.trim()) clubName = data.club_name.trim();
    if (data?.short_name?.trim()) shortName = data.short_name.trim();
  } catch {
    // Keep stable fallback metadata if settings cannot be loaded.
  }

  return {
    title: `${shortName} | ${clubName}`,
    description: `${clubName} — celebrating Peruvian culture, community, and connection at NYU and across New York City.`,
    openGraph: {
      title: `${shortName} | ${clubName}`,
      description: `${clubName} — celebrating Peruvian culture, community, and connection at NYU and across New York City.`,
      siteName: shortName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${shortName} | ${clubName}`,
      description: `${clubName} — celebrating Peruvian culture, community, and connection at NYU and across New York City.`,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
