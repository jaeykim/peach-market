import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const Body = z.object({
  amount: z.number().int().positive(), // 만원
});

// 가계약금 송금 (Mock — 실제 PG/은행 연동 자리)
// 매수인이 송금하면 PAID 상태로 기록되고 상대방에게 알림
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  }

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id) {
    return NextResponse.json(
      { error: "가계약금은 매수인만 송금할 수 있습니다." },
      { status: 403 },
    );
  }
  if (deal.earnestMoneyStatus === "PAID") {
    return NextResponse.json({ error: "이미 송금되었습니다." }, { status: 400 });
  }

  // 플랫폼 에스크로 모델: 송금 즉시 PAID + CONFIRMED. 매도인 별도 확인 불필요.
  const now = new Date();
  const updated = await prisma.deal.update({
    where: { id },
    data: {
      earnestMoney: parsed.data.amount,
      earnestMoneyStatus: "CONFIRMED",
      earnestMoneyPaidAt: now,
      earnestMoneyConfirmedAt: now,
    },
  });

  await notify(deal.sellerId, "CHAT_MESSAGE", {
    dealId: id,
    preview: `🛡️ 가계약금 ${parsed.data.amount.toLocaleString()}만원이 피치마켓 에스크로에 보관되었습니다.`,
  });

  return NextResponse.json({ deal: updated });
}

// 매도인이 가계약금 수령 확인 → CONFIRMED 상태로
export async function PATCH(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.sellerId !== user.id) {
    return NextResponse.json(
      { error: "매도인만 가계약금 수령을 확인할 수 있습니다." },
      { status: 403 },
    );
  }
  if (deal.earnestMoneyStatus !== "PAID") {
    return NextResponse.json({ error: "송금 대기 중인 가계약금이 없습니다." }, { status: 400 });
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: {
      earnestMoneyStatus: "CONFIRMED",
      earnestMoneyConfirmedAt: new Date(),
    },
  });

  await notify(deal.buyerId, "CHAT_MESSAGE", {
    dealId: id,
    preview: "매도인이 가계약금 수령을 확인했습니다. 본 계약을 진행하세요.",
  });

  return NextResponse.json({ deal: updated });
}
