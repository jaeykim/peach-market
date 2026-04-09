import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const PostBody = z.object({
  amount: z.number().int().positive(),
  type: z.enum(["MONTHLY_RENT", "SHORT_TERM_FULL", "DEPOSIT"]),
  billingMonth: z.string().optional(), // "2026-05"
  cardLast4: z.string().optional(),
  cardBrand: z.string().optional(),
});

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

  const payments = await prisma.payment.findMany({
    where: { dealId: id },
    orderBy: { paidAt: "desc" },
  });
  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const deal = await checkAccess(id, user.id);
  if (!deal) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  if (deal.buyerId !== user.id) {
    return NextResponse.json({ error: "임차인(매수인)만 결제할 수 있습니다." }, { status: 403 });
  }

  const parsed = PostBody.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const payment = await prisma.payment.create({
    data: {
      dealId: id,
      amount: parsed.data.amount,
      type: parsed.data.type,
      billingMonth: parsed.data.billingMonth,
      cardLast4: parsed.data.cardLast4 || "1234",
      cardBrand: parsed.data.cardBrand || "현대카드",
      method: "CARD",
      status: "PAID",
    },
  });

  // 집주인에게 결제 알림
  const label =
    parsed.data.type === "MONTHLY_RENT"
      ? `월세 ${parsed.data.billingMonth || ""}`
      : parsed.data.type === "SHORT_TERM_FULL"
      ? "단기임대 전체 금액"
      : "보증금";
  await notify(deal.sellerId, "CHAT_MESSAGE", {
    dealId: id,
    preview: `💳 임차인이 ${label} ${parsed.data.amount.toLocaleString()}만원을 카드로 결제했습니다.`,
  });

  return NextResponse.json({ payment });
}
