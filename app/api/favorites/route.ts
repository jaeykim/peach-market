import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ favorites: [] });
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });
  return NextResponse.json({ favorites: favs });
}

const Body = z.object({ listingId: z.string() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad" }, { status: 400 });
  await prisma.favorite.upsert({
    where: { userId_listingId: { userId: user.id, listingId: parsed.data.listingId } },
    create: { userId: user.id, listingId: parsed.data.listingId },
    update: {},
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad" }, { status: 400 });
  await prisma.favorite
    .delete({
      where: { userId_listingId: { userId: user.id, listingId: parsed.data.listingId } },
    })
    .catch(() => {});
  return NextResponse.json({ ok: true });
}
