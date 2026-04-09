import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { buildContract } from "@/lib/contractTemplate";

const Body = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().optional(),
});

// 집주인이 임차인 신청을 수락 / 거절
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      listing: true,
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          residentNumber: true,
          address: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          residentNumber: true,
          address: true,
        },
      },
    },
  });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.sellerId !== user.id) {
    return NextResponse.json({ error: "집주인만 수락/거절할 수 있습니다." }, { status: 403 });
  }
  if (deal.landlordApprovalStatus === "APPROVED") {
    return NextResponse.json({ error: "이미 수락된 신청입니다." }, { status: 400 });
  }

  if (parsed.data.action === "REJECT") {
    await prisma.deal.update({
      where: { id },
      data: {
        landlordApprovalStatus: "REJECTED",
        landlordRejectReason: parsed.data.reason || null,
        status: "CANCELLED",
      },
    });
    // 가계약금 환불 처리 (mock)
    await prisma.deal.update({
      where: { id },
      data: { earnestMoneyStatus: "REFUNDED" },
    });
    await notify(deal.buyerId, "BID_REJECTED", {
      listingId: deal.listingId,
      listingTitle: deal.listing.title,
      amount: deal.earnestMoney ?? 0,
    });
    return NextResponse.json({ ok: true, status: "REJECTED" });
  }

  // APPROVE: 계약서 자동 생성 + 승인 플래그
  const contract = buildContract({
    listing: deal.listing,
    buyer: deal.buyer,
    seller: deal.seller,
    agreedPrice: deal.agreedPrice,
    rentalStartDate: deal.rentalStartDate,
    rentalEndDate: deal.rentalEndDate,
    contractData: {},
  });

  await prisma.deal.update({
    where: { id },
    data: {
      landlordApprovalStatus: "APPROVED",
      landlordApprovedAt: new Date(),
      contractData: JSON.stringify({
        generatedContract: contract,
        generatedAt: new Date().toISOString(),
      }),
    },
  });

  await notify(deal.buyerId, "BID_ACCEPTED", {
    dealId: id,
    listingTitle: deal.listing.title,
    agreedPrice: deal.agreedPrice,
  });

  return NextResponse.json({ ok: true, status: "APPROVED" });
}
