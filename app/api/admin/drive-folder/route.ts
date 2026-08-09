import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const MAX_MEDIA = 500;
const MAX_FOLDERS = 100;

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  resourceKey?: string;
};

type ImportedMedia = {
  id: string;
  title: string;
  mediaType: "image" | "video";
  driveUrl: string;
  sourceUrl: string;
};

function folderInfo(value: string) {
  const raw = value.trim();
  const folderMatch = raw.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const plainMatch = raw.match(/^([a-zA-Z0-9_-]{10,})$/);
  const id = folderMatch?.[1] || idMatch?.[1] || plainMatch?.[1] || "";
  let resourceKey = "";
  try {
    resourceKey = new URL(raw).searchParams.get("resourcekey") || "";
  } catch {}
  return { id, resourceKey };
}

function titleFromName(name: string) {
  return name.replace(/\.[a-zA-Z0-9]{1,8}$/, "").replace(/[_-]+/g, " ").trim() || "Drive media";
}

async function listChildren(apiKey: string, parentId: string, resourceKey?: string) {
  const files: DriveFile[] = [];
  let pageToken = "";
  do {
    const params = new URLSearchParams({
      key: apiKey,
      q: `'${parentId.replace(/'/g, "\\'")}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,webViewLink,resourceKey)",
      pageSize: "1000",
      orderBy: "name_natural",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const headers: Record<string, string> = {};
    if (resourceKey) headers["X-Goog-Drive-Resource-Keys"] = `${parentId}/${resourceKey}`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers,
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || `Google Drive returned ${response.status}.`;
      throw new Error(message);
    }
    files.push(...((data.files || []) as DriveFile[]));
    pageToken = String(data.nextPageToken || "");
  } while (pageToken);
  return files;
}

async function scanFolder(apiKey: string, rootId: string, rootResourceKey?: string) {
  const queue: { id: string; resourceKey?: string }[] = [{ id: rootId, resourceKey: rootResourceKey }];
  const seenFolders = new Set<string>();
  const media: ImportedMedia[] = [];

  while (queue.length && media.length < MAX_MEDIA && seenFolders.size < MAX_FOLDERS) {
    const current = queue.shift()!;
    if (seenFolders.has(current.id)) continue;
    seenFolders.add(current.id);
    const children = await listChildren(apiKey, current.id, current.resourceKey);
    for (const file of children) {
      if (file.mimeType === FOLDER_MIME) {
        queue.push({ id: file.id, resourceKey: file.resourceKey });
        continue;
      }
      const mediaType = file.mimeType.startsWith("image/") ? "image" : file.mimeType.startsWith("video/") ? "video" : null;
      if (!mediaType) continue;
      const driveUrl = `https://drive.google.com/file/d/${file.id}/view`;
      media.push({
        id: file.id,
        title: titleFromName(file.name),
        mediaType,
        driveUrl,
        sourceUrl: file.webViewLink || driveUrl,
      });
      if (media.length >= MAX_MEDIA) break;
    }
  }
  return media;
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", user.id).single();
  if (!profile || profile.status !== "active" || !["super_admin", "admin", "media_manager"].includes(profile.role)) {
    return NextResponse.json({ error: "You do not have permission to import gallery media." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const folderUrl = String(body.folderUrl || "").trim();
  const { id: folderId, resourceKey } = folderInfo(folderUrl);
  if (!folderId) return NextResponse.json({ error: "Paste a valid Google Drive folder share link." }, { status: 400 });

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      error: "Google Drive folder importing needs the one-time GOOGLE_DRIVE_API_KEY server setting before folders can be scanned.",
      setupRequired: true,
    }, { status: 503 });
  }

  try {
    const media = await scanFolder(apiKey, folderId, resourceKey);
    if (!media.length) {
      return NextResponse.json({ error: "No public image or video files were found. Make the folder 'Anyone with the link → Viewer' and try again." }, { status: 404 });
    }

    const sourceUrls = media.map(item => item.sourceUrl);
    const { data: existing } = await supabase.from("gallery_items").select("source_url").in("source_url", sourceUrls);
    const existingSet = new Set((existing || []).map(row => row.source_url).filter(Boolean));
    const fresh = media.filter(item => !existingSet.has(item.sourceUrl));

    const { data: orderRow } = await supabase.from("gallery_items").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const startOrder = Number(orderRow?.sort_order || 0) + 1;

    if (fresh.length) {
      const rows = fresh.map((item, index) => ({
        title: item.title,
        image_url: item.driveUrl,
        caption: "",
        source_url: item.sourceUrl,
        media_type: item.mediaType,
        sort_order: startOrder + index,
        published: true,
        created_by: user.id,
      }));
      const { error } = await supabase.from("gallery_items").insert(rows);
      if (error) throw error;
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "drive_folder_import",
      entity_type: "gallery_items",
      metadata: { folder_id: folderId, found: media.length, imported: fresh.length, skipped_duplicates: media.length - fresh.length },
    });

    return NextResponse.json({
      ok: true,
      found: media.length,
      imported: fresh.length,
      skipped: media.length - fresh.length,
      media,
      truncated: media.length >= MAX_MEDIA,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to read that Google Drive folder." }, { status: 500 });
  }
}
