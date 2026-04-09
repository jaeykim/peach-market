import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const CreateBid = z.object({
  amount: z.number().int().nonnegative(),
  message: z.string().optional(),
  parentBidId: z.string().optional(),
});

// GET /api/listings/:id/bids
// 권한: 매물 소유자는 모든 비드 조회 / 일반 사용자는 본인이 제안한 비드만 조회
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "매물 없음" }, { status: 404 });

  const isOwner = listing.ownerId === user.id;
  const where = isOwner
    ? { listingId: id }
    : { listingId: id, proposerId: user.id };

  const bids = await prisma.bid.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: { proposer: { select: { id: true, name: true } } },
  });

  // 매물 소유자가 볼 때는 다른 매수자(또는 매도자)들의 비드들이 묶여서 표시될 수 있도록
  // 그룹핑 정보 같이 전달
  return NextResponse.json({ bids, isOwner });
}

// POST /api/listings/:id/bids
// 매물 소유자가 아닌 사용자가 가격을 제안 (counter일 경우 매물 소유자가 자기 매물에 카운터)
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "매물 없음" }, { status: 404 });
  if (listing.status === "CLOSED") {
    return NextResponse.json({ error: "마감된 매물" }, { status: 400 });
  }

  const parsed = CreateBid.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 카운터: parentBid의 proposer가 아닌 측이 제안 가능
  if (parsed.data.parentBidId) {
    const parent = await prisma.bid.findUnique({ where: { id: parsed.data.parentBidId } });
    if (!parent || parent.listingId !== id) {
      return NextResponse.json({ error: "잘못된 카운터" }, { status: 400 });
    }
    // counter는 반대편 당사자만 가능
    const allowedCounter =
      (parent.proposerId === user.id) ? false : true;
    if (!allowedCounter) {
      return NextResponse.json({ error: "본인 비드에는 카운터 불가" }, { status: 403 });
    }
    // counter는 listing owner이거나, parent에서 owner가 제안했던 경우 그 상대방
    if (listing.ownerId !== user.id && parent.proposerId !== listing.ownerId) {
      // 다른 매수자의 비드에는 카운터 불가
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }
  } else {
    // 신규 비드는 매물 소유자가 본인 매물에 못 함
    if (listing.ownerId === user.id) {
      return NextResponse.json({ error: "본인 매물에는 입찰 불가" }, { status: 400 });
    }
  }

  const bid = await prisma.bid.create({
    data: {
      listingId: id,
      proposerId: user.id,
      amount: parsed.data.amount,
      message: parsed.data.message,
      parentBidId: parsed.data.parentBidId,
    },
  });

  // 매물 상태를 협상중으로
  if (listing.status === "OPEN") {
    await prisma.listing.update({ where: { id }, data: { status: "IN_NEGOTIATION" } });
  }

  // 알림: 카운터면 상대방에게, 신규면 매물 소유자에게
  if (parsed.data.parentBidId) {
    const parent = await prisma.bid.findUnique({ where: { id: parsed.data.parentBidId } });
    if (parent) {
      await notify(parent.proposerId, "COUNTER_RECEIVED", {
        listingId: id,
        listingTitle: listing.title,
        amount: parsed.data.amount,
      });
    }
  } else {
    await notify(listing.ownerId, "BID_RECEIVED", {
      listingId: id,
      listingTitle: listing.title,
      amount: parsed.data.amount,
    });
  }

  return NextResponse.json({ bid });
}
