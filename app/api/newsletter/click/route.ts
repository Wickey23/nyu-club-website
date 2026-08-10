import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", request.url));
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.rpc("track_newsletter_click", { p_token: token });
    const target = typeof data === "string" ? data : "";
    if (target) {
      const parsed = new URL(target);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return NextResponse.redirect(parsed);
    }
  } catch {}
  return NextResponse.redirect(new URL("/", request.url));
}
