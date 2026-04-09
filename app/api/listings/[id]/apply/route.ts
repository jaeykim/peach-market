import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const Body = z.object({
  earnestMoney: z.number().int().nonnegative(),
});

// Phase 1 임차 신청 흐름:
// 임차인이 가계약금을 입금하면서 신청 → Deal 생성 (집주인 수락 대기)
// 집주인 수락 시 계약서 자동 생성, 등기부 자동 확인, 양측 서명 진행
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "매물 없음" }, { status: 404 });
  if (listing.status === "CLOSED") {
    return NextResponse.json({ error: "이미 마감된 매물입니다." }, { status: 400 });
  }
  if (listing.ownerId === user.id) {
    return NextResponse.json({ error: "본인 매물에는 신청할 수 없습니다." }, { status: 400 });
  }

  // 이미 진행 중인 이 사용자의 Deal이 있으면 재사용
  const existing = await prisma.deal.findFirst({
    where: {
      listingId: id,
      buyerId: user.id,
      status: { in: ["AGREED", "CONTRACT_READY"] },
    },
  });
  if (existing) {
    return NextResponse.json({ deal: existing, reused: true });
  }

  const now = new Date();
  const deal = await prisma.deal.create({
    data: {
      listingId: listing.id,
      buyerId: user.id,
      sellerId: listing.ownerId,
      agreedPrice: listing.askingPrice,
      // 가계약금 에스크로 즉시 보관 처리
      earnestMoney: parsed.data.earnestMoney,
      earnestMoneyStatus: "CONFIRMED",
      earnestMoneyPaidAt: now,
      earnestMoneyConfirmedAt: now,
      // 집주인 수락 대기
      landlordApprovalStatus: "PENDING",
    },
  });

  // 매물 상태 협상중
  if (listing.status === "OPEN") {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: "IN_NEGOTIATION" },
    });
  }

  // 집주인에게 신청 알림
  await notify(listing.ownerId, "BID_RECEIVED", {
    dealId: deal.id,
    listingId: listing.id,
    listingTitle: listing.title,
    amount: parsed.data.earnestMoney,
  });

  return NextResponse.json({ deal });
}
