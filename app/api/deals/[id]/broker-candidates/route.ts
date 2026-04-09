import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 딜에 추천할 공인중개사 후보 (지역 매칭 우선)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const m = deal.listing.address.match(/([가-힣]+구)\s/);
  const region = m ? m[1] : null;

  const select = {
    id: true,
    name: true,
    brokerLicense: true,
    brokerOffice: true,
    brokerRegion: true,
    verifiedAt: true,
  };

  // 지역 매칭 중개사 + 보충
  const regional = region
    ? await prisma.user.findMany({
        where: { isBroker: true, brokerRegion: { contains: region } },
        select,
        take: 5,
      })
    : [];
  const others = await prisma.user.findMany({
    where: {
      isBroker: true,
      ...(regional.length > 0
        ? { id: { notIn: regional.map((r) => r.id) } }
        : {}),
    },
    select,
    take: 5,
  });

  // 추천 사유와 함께
  const candidates = [
    ...regional.map((b) => ({
      ...b,
      matchReason: `${region} 지역 전문`,
      score: 95,
    })),
    ...others.map((b) => ({
      ...b,
      matchReason: "광역 활동",
      score: 75,
    })),
  ].slice(0, 3);

  return NextResponse.json({ candidates });
}
