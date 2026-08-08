export const clubMedia = {
  conversation: [
    "https://media.licdn.com/dms/image/v2/D4E22AQHzmvopsJFE7A/feedshare-image-high-res/B4EZoydz2EKMAo-/0/1761783271995?e=2147483647&t=PviuMkp4kJT9ojsU9eyO8mQlErU0kE4cUcYGFyimtSo&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQE-CAE0ToYQGA/feedshare-shrink_800/B4EZoydz1sKgAg-/0/1761783269826?e=2147483647&t=qfYhZSfYCH0TftzR6PnuiVxipSH0gBeKxGrMqrlvEbk&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQHE8N0OFC2Syg/feedshare-shrink_800/B4EZoydz2OLMAg-/0/1761783271859?e=2147483647&t=r7NDv5MYzdNDYNYqpSHvfWL7S7hSFwriurQBWTZ0tLg&v=beta",
    "https://media.licdn.com/dms/image/v2/D4E22AQHB8I6VfgaXBQ/feedshare-shrink_800/B4EZoydz1.KoAg-/0/1761783271572?e=2147483647&t=pRzLluBGTYyIvFwcYLx7jMW2hY1ybqjlBNMFviRUiEo&v=beta"
  ],
  engageAtlas: "/engage/engage-atlas.webp",
  engage: {
    jointBoards: { backgroundImage: "url(/engage/engage-atlas.webp)", backgroundSize: "200% 200%", backgroundPosition: "0% 0%" },
    warique: { backgroundImage: "url(/engage/engage-atlas.webp)", backgroundSize: "200% 200%", backgroundPosition: "100% 0%" },
    causa: { backgroundImage: "url(/engage/engage-atlas.webp)", backgroundSize: "200% 200%", backgroundPosition: "0% 100%" },
    evaGroup: { backgroundImage: "url(/engage/engage-atlas.webp)", backgroundSize: "200% 200%", backgroundPosition: "100% 100%" },
  }
};

export const galleryImages = [
  {
    id: "conversation-musical-01",
    title: "Conversación Musical",
    image: clubMedia.conversation[0],
    description: "Eva Ayllón × Daniela Darcourt at the NYU Peruvian Student Association's 2025 Conversación Musical.",
    source: "NYU Peruvian Student Association · LinkedIn",
    sourceUrl: "https://www.linkedin.com/company/nyuperu"
  },
  {
    id: "engage-joint-boards",
    title: "NYU × Columbia Peruvian Student Associations",
    image: clubMedia.engageAtlas,
    atlasPosition: "0% 0%",
    description: "The 2024–2025 Executive Boards of NYU and Columbia University's Peruvian Student Associations come together for a group picture.",
    source: "NYU Engage",
    sourceUrl: "https://engage.nyu.edu/organization/viva-peru-all-university/gallery"
  },
  {
    id: "engage-warique",
    title: "Community at Warique",
    image: clubMedia.engageAtlas,
    atlasPosition: "100% 0%",
    description: "Association members gather at Warique Restaurant in Brooklyn to enjoy Peruvian cuisine and strengthen bonds.",
    source: "NYU Engage",
    sourceUrl: "https://engage.nyu.edu/organization/viva-peru-all-university/gallery"
  },
  {
    id: "engage-causa",
    title: "Causa Limeña",
    image: clubMedia.engageAtlas,
    atlasPosition: "0% 100%",
    description: "A traditional Peruvian dish made of seasoned yellow potato purée, layered with a savory tuna salad and fresh avocado slices, and finished with a signature Peruvian olive garnish.",
    source: "NYU Engage",
    sourceUrl: "https://engage.nyu.edu/organization/viva-peru-all-university/gallery"
  },
  {
    id: "engage-eva-group",
    title: "Eva Ayllón with ¡Viva Perú!",
    image: clubMedia.engageAtlas,
    atlasPosition: "100% 100%",
    description: "Eva Ayllón stands alongside members of the NYU Peruvian Student Association during the club's October 2023 program.",
    source: "NYU Engage",
    sourceUrl: "https://engage.nyu.edu/organization/viva-peru-all-university/gallery"
  }
];

export const archiveEvents = [
  { title: "La Gran Chocolatada", date: "Dec. 11, 2025", source: "NYU Engage" },
  { title: "¡Viva Perú! at The Met", date: "Mar. 14, 2025", source: "Club social archive" },
  { title: "Andean Discovery", date: "Mar. 4, 2025", source: "Club social archive" },
  { title: "Peru vs. Brazil Watch Party", date: "Oct. 15, 2024", source: "Club social archive" },
  { title: "Conversation with Eva Ayllón", date: "Oct. 20, 2023", source: "NYU Engage" }
];
