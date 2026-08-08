import { NextResponse } from "next/server";
import { isAllowedAdmin, setAdminCookie } from "../../../lib/adminAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (!isAllowedAdmin(email)) {
    return NextResponse.json({ error: "This email is not approved for board access." }, { status: 403 });
  }
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect club admin password." }, { status: 401 });
  }

  await setAdminCookie(email);
  return NextResponse.json({ ok: true, email });
}
