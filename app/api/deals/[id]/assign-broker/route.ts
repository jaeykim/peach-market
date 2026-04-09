import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const Body = z.object({ brokerId: z.string().optional() });

// 검토 중개사 배정. brokerId가 있으면 해당 중개사로, 없으면 자동 매칭.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
  if (deal.brokerId) {
    return NextResponse.json({ error: "이미 중개사가 배정되었습니다." }, { status: 400 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  const explicitId = parsed.success ? parsed.data.brokerId : undefined;

  let broker = null;
  if (explicitId) {
    broker = await prisma.user.findFirst({
      where: { id: explicitId, isBroker: true },
    });
  } else {
    // 지역 매칭 자동 배정
    const m = deal.listing.address.match(/([가-힣]+구)\s/);
    const region = m ? m[1] : null;
    broker = region
      ? await prisma.user.findFirst({
          where: { isBroker: true, brokerRegion: { contains: region } },
        })
      : null;
    if (!broker) {
      broker = await prisma.user.findFirst({ where: { isBroker: true } });
    }
  }
  if (!broker) {
    return NextResponse.json({ error: "가용 중개사가 없습니다." }, { status: 503 });
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: { brokerId: broker.id, brokerStatus: "PENDING_REVIEW" },
    include: {
      broker: {
        select: { id: true, name: true, brokerLicense: true, brokerOffice: true, brokerRegion: true },
      },
    },
  });

  // 양 당사자에게 알림
  await notify(deal.buyerId, "DEAL_CLOSED", {
    dealId: deal.id,
    listingTitle: deal.listing.title,
    agreedPrice: deal.agreedPrice,
    brokerAssigned: broker.name,
  });
  if (deal.sellerId !== deal.buyerId) {
    await notify(deal.sellerId, "DEAL_CLOSED", {
      dealId: deal.id,
      listingTitle: deal.listing.title,
      agreedPrice: deal.agreedPrice,
      brokerAssigned: broker.name,
    });
  }

  return NextResponse.json({ deal: updated });
}
