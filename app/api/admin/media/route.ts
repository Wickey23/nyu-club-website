import { NextResponse } from "next/server";
import { currentAdmin } from "../../../lib/adminAuth";

function safeName(name: string) {
  const clean = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean || "upload.jpg";
}

export async function POST(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) return NextResponse.json({ error: "GITHUB_CONTENT_TOKEN is not configured in Vercel." }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Images must be 8 MB or smaller." }, { status: 400 });

  const filename = `${Date.now()}-${safeName(file.name)}`;
  const repoPath = `public/uploads/${filename}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const api = `https://api.github.com/repos/Wickey23/nyu-club-website/contents/${repoPath}`;
  const response = await fetch(api, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Upload ${filename} by ${admin.email}`,
      content: bytes.toString("base64"),
      branch: "main",
    }),
  });
  const result = await response.json();
  if (!response.ok) return NextResponse.json({ error: result.message || "Upload failed" }, { status: response.status });
  return NextResponse.json({ ok: true, url: `/uploads/${filename}`, commit: result.commit?.sha });
}
