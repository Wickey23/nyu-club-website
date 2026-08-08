import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "¡Viva Perú! | NYU Peruvian Student Association",
  description:
    "The NYU Peruvian Student Association — celebrating Peruvian culture, community, and connection in New York City.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
