import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ALLOWED = ["ko", "en", "zh", "ja", "vi", "mn", "ru", "id"];

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  if (!ALLOWED.includes(locale)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const c = await cookies();
  c.set("pm_locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true });
}
