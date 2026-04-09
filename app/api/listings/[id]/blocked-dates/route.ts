import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 매물의 이미 예약된(승인된) 임대 기간 목록
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // 승인된 딜 또는 진행 중(승인 대기 포함) 딜의 기간을 모두 블락
  const deals = await prisma.deal.findMany({
    where: {
      listingId: id,
      status: { not: "CANCELLED" },
      landlordApprovalStatus: { not: "REJECTED" },
      rentalStartDate: { not: null },
      rentalEndDate: { not: null },
    },
    select: {
      rentalStartDate: true,
      rentalEndDate: true,
      landlordApprovalStatus: true,
    },
  });

  const blocks = deals.map((d) => ({
    start: d.rentalStartDate!.toISOString().slice(0, 10),
    end: d.rentalEndDate!.toISOString().slice(0, 10),
    confirmed: d.landlordApprovalStatus === "APPROVED",
  }));

  return NextResponse.json({ blocks });
}
