import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { buildContract } from "@/lib/contractTemplate";

// 임차인이 방을 신청하면 Deal을 즉시 생성하고 계약서를 자동으로 발급한다.
// 이후 흐름: 임차인 서명 → 카드결제 → 임대인 서명·승인 → 거래 완료
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
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

  const deal = await prisma.deal.create({
    data: {
      listingId: listing.id,
      buyerId: user.id,
      sellerId: listing.ownerId,
      agreedPrice: listing.askingPrice,
    },
  });

  // 계약서 자동 생성
  const buyer = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      residentNumber: true,
      address: true,
    },
  });
  const seller = await prisma.user.findUnique({
    where: { id: listing.ownerId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      residentNumber: true,
      address: true,
    },
  });

  if (buyer && seller) {
    const contract = buildContract({
      listing,
      buyer,
      seller,
      agreedPrice: listing.askingPrice,
      contractData: {},
    });
    await prisma.deal.update({
      where: { id: deal.id },
      data: {
        contractData: JSON.stringify({
          generatedContract: contract,
          generatedAt: new Date().toISOString(),
        }),
      },
    });
  }

  // 매물 상태 협상중
  if (listing.status === "OPEN") {
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: "IN_NEGOTIATION" },
    });
  }

  // 임대인에게 알림
  await notify(listing.ownerId, "DEAL_CLOSED", {
    dealId: deal.id,
    listingTitle: listing.title,
    agreedPrice: listing.askingPrice,
  });

  return NextResponse.json({ deal });
}
