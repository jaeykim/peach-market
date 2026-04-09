import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

// 임차인이 입주 확정 → 에스크로 해제 → 임대인 계좌로 송금 (Mock)
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id) {
    return NextResponse.json({ error: "임차인만 입주 확정을 할 수 있습니다." }, { status: 403 });
  }
  if (deal.status === "COMPLETED") {
    return NextResponse.json({ error: "이미 완료된 거래입니다." }, { status: 400 });
  }

  // 양측 서명 확인
  const contractData = deal.contractData ? JSON.parse(deal.contractData) : {};
  if (!contractData.buyerSignature || !contractData.sellerSignature) {
    return NextResponse.json(
      { error: "양측 전자서명이 완료된 뒤 입주 확정이 가능합니다." },
      { status: 400 },
    );
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  // 임대인에게 알림 (에스크로 해제)
  await notify(deal.sellerId, "DEAL_CLOSED", {
    dealId: id,
    listingTitle: deal.listing.title,
    agreedPrice: deal.agreedPrice,
  });

  return NextResponse.json({ deal: updated });
}
