import { galleryImageUrl } from "../../lib/mediaUrl";

export type NewsletterEvent={id:string;title:string;date:string;time:string;location:string;description:string;image:string;rsvpUrl:string;status:string};
export type NewsletterGalleryItem={id:string;title:string;image:string;description:string;sourceUrl?:string;mediaType?:"image"|"video";createdAt?:string};
export type NewsletterSettings={clubName:string;shortName:string;email:string;instagram:string;linkedin:string;cmsConfig?:{newsletter?:{footerText?:string;defaultHeader?:string;signupConfirmation?:string;unsubscribeConfirmation?:string}}};

const entities:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"};
export function escapeHtml(value:string){return (value||"").replace(/[&<>"']/g,(c)=>entities[c]||c);}
export function formatEventDate(value:string){if(!value)return "Date TBA";const d=new Date(`${value}T12:00:00`);return Number.isNaN(d.getTime())?value:d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});}
export function formatEventTime(value:string){if(!value)return "";const [h,m]=value.split(":").map(Number);if(Number.isNaN(h))return value;const d=new Date();d.setHours(h,m||0);return d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});}

function eventCard(e:NewsletterEvent){
  const image=e.image?`<td width="150" style="padding:0"><img src="${escapeHtml(galleryImageUrl(e.image))}" alt="" width="150" style="width:150px;height:130px;object-fit:cover;display:block;border-radius:14px 0 0 14px"></td>`:"";
  const time=e.time?` · ${escapeHtml(formatEventTime(e.time))}`:"";
  const description=e.description?`<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.55;color:#625b55;margin:0">${escapeHtml(e.description.slice(0,220))}${e.description.length>220?"…":""}</p>`:"";
  const rsvp=e.rsvpUrl?`<p style="margin:14px 0 0"><a href="${escapeHtml(e.rsvpUrl)}" style="font-family:Arial,sans-serif;color:#c91525;font-weight:700">RSVP / details →</a></p>`:"";
  return `<tr><td style="padding:10px 32px"><table role="presentation" width="100%" style="border-collapse:collapse;border:1px solid #e7ded4;border-radius:14px;background:#fff"><tr>${image}<td style="padding:18px"><div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#c91525">${escapeHtml(formatEventDate(e.date))}${time}</div><h3 style="font-family:Georgia,serif;font-size:22px;margin:6px 0;color:#171412">${escapeHtml(e.title)}</h3><p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#625b55;margin:0 0 8px">${escapeHtml(e.location)}</p>${description}${rsvp}</td></tr></table></td></tr>`;
}

function eventSection(events:NewsletterEvent[]){if(!events.length)return "";return `<tr><td style="padding:10px 32px 8px"><h2 style="font-family:Georgia,serif;font-size:28px;margin:0;color:#171412">Coming up</h2></td></tr>${events.map(eventCard).join("")}`;}
function galleryCell(g:NewsletterGalleryItem){return `<td width="33.33%" style="padding:3px"><img src="${escapeHtml(galleryImageUrl(g.image))}" alt="${escapeHtml(g.title)}" width="180" style="width:100%;height:150px;object-fit:cover;display:block;border-radius:10px"></td>`;}
function galleryRow(items:NewsletterGalleryItem[]){return `<tr>${items.map(galleryCell).join("")}</tr>`;}
function gallerySection(items:NewsletterGalleryItem[]){if(!items.length)return "";const rows=galleryRow(items.slice(0,3))+(items.length>3?galleryRow(items.slice(3,6)):"");return `<tr><td style="padding:22px 32px 8px"><h2 style="font-family:Georgia,serif;font-size:28px;margin:0 0 14px;color:#171412">From the community</h2><table role="presentation" width="100%" style="border-collapse:collapse">${rows}</table></td></tr>`;}

export function buildNewsletterHtml(args:{origin:string;settings:NewsletterSettings;preview:string;heading:string;intro:string;closing:string;ctaLabel:string;events:NewsletterEvent[];gallery:NewsletterGalleryItem[]}){
  const brand=args.settings.shortName||args.settings.clubName||"NYU Perú";
  const defaults=args.settings.cmsConfig?.newsletter||{};
  const events=eventSection(args.events),gallery=gallerySection(args.gallery);
  const header=defaults.defaultHeader?.trim()||args.settings.clubName||brand;
  const footer=defaults.footerText?.trim()||"You’re receiving this because you subscribed to club updates. An unsubscribe link is included automatically when this campaign is sent.";
  return `<!doctype html><html><body style="margin:0;background:#f4ede4"><div style="display:none;max-height:0;overflow:hidden">${escapeHtml(args.preview)}</div><table role="presentation" width="100%" style="border-collapse:collapse;background:#f4ede4"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="640" style="width:100%;max-width:640px;border-collapse:collapse;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="background:#c91525;padding:28px 32px;color:#fff"><div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(header)}</div><div style="font-family:Georgia,serif;font-size:38px;font-weight:700;margin-top:5px">${escapeHtml(brand)}</div></td></tr><tr><td style="padding:34px 32px 18px"><h1 style="font-family:Georgia,serif;font-size:38px;line-height:1.05;color:#171412;margin:0 0 18px">${escapeHtml(args.heading)}</h1><p style="font-family:Arial,sans-serif;font-size:17px;line-height:1.65;color:#625b55;margin:0">${escapeHtml(args.intro)}</p></td></tr>${events}${gallery}<tr><td style="padding:26px 32px"><p style="font-family:Arial,sans-serif;font-size:16px;line-height:1.65;color:#625b55;margin:0 0 22px">${escapeHtml(args.closing)}</p><a href="${escapeHtml(args.origin)}" style="display:inline-block;background:#c91525;color:white;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;padding:14px 20px;border-radius:8px">${escapeHtml(args.ctaLabel)}</a></td></tr><tr><td style="padding:24px 32px;background:#181514;color:#bdb5af;font-family:Arial,sans-serif;font-size:12px;line-height:1.6"><b style="color:white">${escapeHtml(args.settings.clubName||brand)}</b><br>${escapeHtml(args.settings.email||"")}<br><br>${escapeHtml(footer)}</td></tr></table></td></tr></table></body></html>`;
}
