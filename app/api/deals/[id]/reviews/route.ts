import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const reviews = await prisma.review.findMany({
    where: { dealId: id },
    include: {
      author: { select: { id: true, name: true } },
      target: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  if (deal.status !== "COMPLETED") {
    return NextResponse.json({ error: "거래 완료 후에만 후기를 작성할 수 있습니다." }, { status: 400 });
  }

  const targetId = deal.buyerId === user.id ? deal.sellerId : deal.buyerId;
  const review = await prisma.review.upsert({
    where: { dealId_authorId: { dealId: id, authorId: user.id } },
    create: {
      dealId: id,
      authorId: user.id,
      targetId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });
  return NextResponse.json({ review });
}
