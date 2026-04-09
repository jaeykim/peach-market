import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 매물 추천: BUY 매물에는 매칭되는 SELL 매물을, SELL 매물에는 매칭되는 BUY 희망을 제안
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ matches: [] });

  // 반대 측 매물 중 propertyType + dealType이 일치하고 가격대가 비슷한 것
  const oppositeSide = listing.side === "SELL" ? "BUY" : "SELL";
  const minPrice = Math.round(listing.askingPrice * 0.85);
  const maxPrice = Math.round(listing.askingPrice * 1.15);

  // 같은 구
  const m = listing.address.match(/([가-힣]+구|[가-힣]+군|[가-힣]+시)\s/);
  const region = m ? m[1] : "";

  const candidates = await prisma.listing.findMany({
    where: {
      side: oppositeSide,
      status: { not: "CLOSED" },
      propertyType: listing.propertyType,
      dealType: listing.dealType,
      askingPrice: { gte: minPrice, lte: maxPrice },
      ...(region ? { address: { contains: region } } : {}),
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      side: true,
      title: true,
      address: true,
      askingPrice: true,
      areaExclusive: true,
    },
  });

  return NextResponse.json({ matches: candidates });
}
