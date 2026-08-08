import { NextResponse } from "next/server";
import { currentAdmin } from "../../../lib/adminAuth";

const owner = "Wickey23";
const repo = "nyu-club-website";
const path = "content/site.json";
const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

function headers(write = false) {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(write ? { "Content-Type": "application/json" } : {}),
  };
}

async function getFile() {
  const response = await fetch(`${api}?ref=main&ts=${Date.now()}`, { headers: headers(), cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load CMS content (${response.status})`);
  return response.json();
}

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const file = await getFile();
    const text = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
    return NextResponse.json({ content: JSON.parse(text), sha: file.sha, admin: admin.email });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GITHUB_CONTENT_TOKEN) {
    return NextResponse.json({ error: "GITHUB_CONTENT_TOKEN is not configured in Vercel." }, { status: 503 });
  }

  try {
    const content = await request.json();
    const current = await getFile();
    const response = await fetch(api, {
      method: "PUT",
      headers: headers(true),
      body: JSON.stringify({
        message: `CMS update by ${admin.email}`,
        content: Buffer.from(JSON.stringify(content, null, 2) + "\n").toString("base64"),
        sha: current.sha,
        branch: "main",
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "GitHub rejected the content update");
    return NextResponse.json({ ok: true, commit: result.commit?.sha });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save content" }, { status: 500 });
  }
}
