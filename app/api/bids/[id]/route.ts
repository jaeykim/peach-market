import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Patch = z.object({
  action: z.enum(["ACCEPT", "REJECT", "WITHDRAW"]),
});

// 비드 상태 변경: 수락/거절/철회
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const bid = await prisma.bid.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!bid) return NextResponse.json({ error: "비드 없음" }, { status: 404 });

  const listing = bid.listing;
  const isOwner = listing.ownerId === user.id;
  const isProposer = bid.proposerId === user.id;

  if (parsed.data.action === "WITHDRAW") {
    if (!isProposer) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    await prisma.bid.update({ where: { id }, data: { status: "WITHDRAWN" } });
    return NextResponse.json({ ok: true });
  }

  // ACCEPT/REJECT는 상대방만 가능
  if (isProposer) return NextResponse.json({ error: "본인 제안은 본인이 수락/거절 불가" }, { status: 403 });

  // 일반 사용자는 본인이 받은 카운터(즉 자기가 시작한 협상에서 owner가 보낸 counter)에 대해서만 수락 가능
  if (!isOwner) {
    // 본인이 시작한 비드의 카운터인지 체크 (부모 체인 따라가며 검증)
    let parentId: string | null = bid.parentBidId;
    let allowed = false;
    while (parentId) {
      const parent = await prisma.bid.findUnique({ where: { id: parentId } });
      if (!parent) break;
      if (parent.proposerId === user.id) { allowed = true; break; }
      parentId = parent.parentBidId;
    }
    if (!allowed) return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  if (parsed.data.action === "REJECT") {
    await prisma.bid.update({ where: { id }, data: { status: "REJECTED" } });
    return NextResponse.json({ ok: true });
  }

  // ACCEPT → Deal 생성
  await prisma.bid.update({ where: { id }, data: { status: "ACCEPTED" } });

  // 매수자/매도자 식별
  // 매물이 SELL인 경우: ownerId=seller, 비드 협상의 시작 proposer = buyer
  // 매물이 BUY인 경우 : ownerId=buyer , 비드 협상의 시작 proposer = seller
  // 협상 시작 proposer를 찾기 위해 부모 체인 루트로
  let rootProposerId = bid.proposerId;
  let rootParentId: string | null = bid.parentBidId;
  while (rootParentId) {
    const parent = await prisma.bid.findUnique({ where: { id: rootParentId } });
    if (!parent) break;
    rootProposerId = parent.proposerId;
    rootParentId = parent.parentBidId;
  }
  const counterpartyId = rootProposerId;

  const buyerId = listing.side === "SELL" ? counterpartyId : listing.ownerId;
  const sellerId = listing.side === "SELL" ? listing.ownerId : counterpartyId;

  const deal = await prisma.deal.create({
    data: {
      listingId: listing.id,
      buyerId,
      sellerId,
      agreedPrice: bid.amount,
    },
  });

  await prisma.listing.update({ where: { id: listing.id }, data: { status: "CLOSED" } });

  return NextResponse.json({ ok: true, dealId: deal.id });
}
