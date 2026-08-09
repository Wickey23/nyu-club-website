export function googleDriveFileId(url:string) {
  if (!url) return "";
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/i,
    /drive\.google\.com\/open\?id=([^&]+)/i,
    /drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&]+)/i,
    /[?&]id=([^&]+)/i,
  ];
  for (const pattern of patterns) {
    const match=url.match(pattern);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return "";
}

export function isGoogleDriveUrl(url:string) {
  return /(^|\.)drive\.google\.com/i.test(url || "");
}

export function galleryImageUrl(url:string) {
  const id=googleDriveFileId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}` : url;
}

export function galleryVideoEmbedUrl(url:string) {
  const id=googleDriveFileId(url);
  if (id) return `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
  return url;
}
