import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const Body = z.object({ text: z.string().min(1).max(2000) });

async function checkAccess(dealId: string, userId: string) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!deal) return null;
  if (deal.buyerId !== userId && deal.sellerId !== userId) return null;
  return deal;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const deal = await checkAccess(id, user.id);
  if (!deal) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const messages = await prisma.chatMessage.findMany({
    where: { dealId: id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const deal = await checkAccess(id, user.id);
  if (!deal) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const message = await prisma.chatMessage.create({
    data: { dealId: id, senderId: user.id, text: parsed.data.text },
    include: { sender: { select: { id: true, name: true } } },
  });

  // 상대방에게 알림
  const otherId = deal.buyerId === user.id ? deal.sellerId : deal.buyerId;
  await notify(otherId, "CHAT_MESSAGE", {
    dealId: id,
    preview: parsed.data.text.slice(0, 60),
  });

  return NextResponse.json({ message });
}
