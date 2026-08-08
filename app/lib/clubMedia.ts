export const clubMedia = {
  conversation: [
    "https://media.licdn.com/dms/image/v2/D4E22AQE-CAE0ToYQGA/feedshare-shrink_800/B4EZoydz1sKgAg-/0/1761783269826?e=2147483647&t=qfYhZSfYCH0TftzR6PnuiVxipSH0gBeKxGrMqrlvEbk&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQHzmvopsJFE7A/feedshare-image-high-res/B4EZoydz2EKMAo-/0/1761783271995?e=2147483647&t=PviuMkp4kJT9ojsU9eyO8mQlErU0kE4cUcYGFyimtSo&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQE1T4nxsCCS0Q/feedshare-shrink_800/B4EZoydz2LIQAg-/0/1761783271435?e=2147483647&t=DX9D_kbraoinqC1UcDtVf192aXW9FbUN5jD8oEofcgg&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQFfrR_tbmeWyA/feedshare-image-high-res/B4EZoydz2JKsAo-/0/1761783271914?e=2147483647&t=M53T20IIKW1x-8eFJqNHMXNl8akvFzsxwZC_B4qJpDA&v=beta"
  ],
  board: [
    "https://media.licdn.com/dms/image/v2/D4E22AQGZ69hEvWYZeA/feedshare-shrink_1280/B4EZoyYTH.HcAs-/0/1761781822493?e=2147483647&t=qEmDMWys50NbjcgJ0Tk2ZqzD6X7UBK7s8m6HuKIpwFY&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQGRn8MtaAVeCg/feedshare-image-high-res/B4EZoyYTH9HEAo-/0/1761781822640?e=2147483647&t=OmihnD_FhxxL5fza1ZMABb_ot-5ptNBZb29lmpQ9wr8&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQGeRqLkmMxouA/feedshare-image-high-res/B4EZoyYTHaIUAs-/0/1761781822668?e=2147483647&t=LsT3OCsE12h2UstkQ-41x-maUVT1mPilG7YlFQ4FoJg&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQEpoP0Q0l9DcQ/feedshare-shrink_1280/B4EZoyYTHyIoAs-/0/1761781822604?e=2147483647&t=eyk-sZYhsGTrkRERcetLsaNRgTNsvPfaY0UK0q51Rv4&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQGgrIrJ0BvtwQ/feedshare-image-high-res/B4EZoyYTHxKMAo-/0/1761781822674?e=2147483647&t=QuqNHDSx-dB9Uw7lX4zwJc0PNkqp3jf1oNQwk8RSnMs&v=beta"
  ],
  wsnDance: {
    hero: "https://nyunews.com/wp-content/uploads/2023/10/cropped-bailar-20-1200x800.jpg",
    pair: "https://nyunews.com/wp-content/uploads/2023/10/bailar-8-600x400.jpg",
    flags: "https://nyunews.com/wp-content/uploads/2023/10/bailar-12-600x400.jpg",
    source: "https://nyunews.com/culture/iequity/2023/10/17/hispanic-heritage-month-bailar-honrar/"
  }
} as const;

const linkedinSource = "https://www.linkedin.com/company/nyuperu";

export const galleryImages = [
  {
    id: "conversation-1",
    src: clubMedia.conversation[0],
    alt: "NYU Peruvian Student Association Conversación Musical event",
    date: "October 11, 2025",
    title: "A night of Peruvian music",
    event: "Conversación Musical",
    description: "A club event featuring Peruvian musical voices Eva Ayllón and Daniela Darcourt, bringing students and guests together around music, culture, and conversation.",
    sourceLabel: "NYU Peruvian Student Association · LinkedIn",
    sourceUrl: linkedinSource
  },
  {
    id: "conversation-2",
    src: clubMedia.conversation[1],
    alt: "Guests at NYU Peruvian Student Association Conversación Musical",
    date: "October 11, 2025",
    title: "Community through conversation",
    event: "Conversación Musical",
    description: "One of the club's largest documented cultural programs, with more than 100 guests attending the conversation and music-focused gathering.",
    sourceLabel: "NYU Peruvian Student Association · LinkedIn",
    sourceUrl: linkedinSource
  },
  {
    id: "conversation-3",
    src: clubMedia.conversation[2],
    alt: "Peruvian artists and community at NYU event",
    date: "October 11, 2025",
    title: "Peruvian voices at NYU",
    event: "Conversación Musical",
    description: "A cultural conversation connecting the NYU community with prominent Peruvian artists and contemporary Peruvian music.",
    sourceLabel: "NYU Peruvian Student Association · LinkedIn",
    sourceUrl: linkedinSource
  },
  {
    id: "conversation-4",
    src: clubMedia.conversation[3],
    alt: "NYU Peruvian Student Association cultural event photo",
    date: "October 11, 2025",
    title: "Culture in community",
    event: "Conversación Musical",
    description: "Official club photography from the 2025 Conversación Musical program at NYU.",
    sourceLabel: "NYU Peruvian Student Association · LinkedIn",
    sourceUrl: linkedinSource
  },
  ...clubMedia.board.map((src, index) => ({
    id: `board-${index + 1}`,
    src,
    alt: `NYU Peruvian Student Association 2025–26 executive board image ${index + 1}`,
    date: "2025–26",
    title: index === 0 ? "Meet the 2025–26 board" : "The team behind ¡Viva Perú!",
    event: "Executive Board",
    description: "Official imagery introducing members of the NYU Peruvian Student Association's 2025–26 leadership team.",
    sourceLabel: "NYU Peruvian Student Association · LinkedIn",
    sourceUrl: linkedinSource
  }))
] as const;

export const archiveEvents = [
  {
    date: "December 11, 2025",
    title: "La Gran Chocolatada",
    description: "The club's annual community celebration built around the Peruvian tradition of chocolatada and collaboration with other Latin American student organizations.",
    sourceUrl: "https://engage.nyu.edu/event/11915948"
  },
  {
    date: "March 14, 2025",
    title: "¡Viva Perú! at The Met",
    description: "A cultural museum experience connecting students with Peruvian history, art, and New York City's cultural institutions.",
    sourceUrl: linkedinSource
  },
  {
    date: "March 4, 2025",
    title: "Andean Discovery",
    description: "A club program centered on Andean heritage and cultural discovery. The indexed public record exposes only partial event copy, so this entry remains intentionally concise.",
    sourceUrl: linkedinSource
  },
  {
    date: "October 15, 2024",
    title: "Peru vs. Brazil Watch Party",
    description: "A community watch party bringing students together around Peru's national football team.",
    sourceUrl: linkedinSource
  }
] as const;
