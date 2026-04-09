import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const Body = z.object({
  earnestMoney: z.number().int().nonnegative(),
  startDate: z.string(),
  endDate: z.string(),
  rentalMode: z.enum(["MONTHLY", "SHORT_TERM"]),
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

  // 기간 검증
  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "잘못된 날짜입니다." }, { status: 400 });
  }
  const daysDiff = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  // 단기임대 모드 가능 여부 검증
  if (parsed.data.rentalMode === "SHORT_TERM" && !listing.isShortTerm) {
    return NextResponse.json(
      { error: "이 매물은 단기임대를 받지 않습니다." },
      { status: 400 },
    );
  }

  // 모드별 최소 기간
  const minDays =
    parsed.data.rentalMode === "SHORT_TERM"
      ? listing.shortTermMinMonths * 30
      : 365;
  const minLabel =
    parsed.data.rentalMode === "SHORT_TERM"
      ? `${listing.shortTermMinMonths}개월`
      : "1년";
  if (daysDiff < minDays) {
    return NextResponse.json(
      { error: `${parsed.data.rentalMode === "SHORT_TERM" ? "단기" : "월세"} 임대 기간은 최소 ${minLabel} 이상이어야 합니다.` },
      { status: 400 },
    );
  }

  // 겹침 검사 (이미 예약된 기간과 겹치는지)
  const overlapping = await prisma.deal.findFirst({
    where: {
      listingId: id,
      status: { not: "CANCELLED" },
      landlordApprovalStatus: { not: "REJECTED" },
      rentalStartDate: { lt: end },
      rentalEndDate: { gt: start },
    },
  });
  if (overlapping) {
    return NextResponse.json(
      { error: "이미 예약된 기간과 겹칩니다. 다른 날짜를 선택해주세요." },
      { status: 409 },
    );
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
      rentalStartDate: start,
      rentalEndDate: end,
      rentalMode: parsed.data.rentalMode,
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
