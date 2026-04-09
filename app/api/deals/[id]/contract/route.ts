import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildContract } from "@/lib/contractTemplate";

// 표준 부동산 계약서 자동 생성 (템플릿 기반)
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

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
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const contractData = deal.contractData ? JSON.parse(deal.contractData) : {};

  const contract = buildContract({
    listing: deal.listing,
    buyer: deal.buyer,
    seller: deal.seller,
    agreedPrice: deal.agreedPrice,
    rentalStartDate: deal.rentalStartDate,
    rentalEndDate: deal.rentalEndDate,
    contractData,
  });

  // 저장
  const merged = {
    ...contractData,
    generatedContract: contract,
    generatedAt: new Date().toISOString(),
  };
  await prisma.deal.update({
    where: { id },
    data: { contractData: JSON.stringify(merged) },
  });

  return NextResponse.json({ contract });
}
