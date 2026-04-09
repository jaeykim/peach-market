import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notify } from "@/lib/notify";

const Body = z.object({ signature: z.string().min(10) });

// 전자서명 저장: 매도자/매수자 본인이 자기 서명을 저장
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const isBuyer = deal.buyerId === user.id;
  const contractData = deal.contractData ? JSON.parse(deal.contractData) : {};
  const now = new Date().toISOString();
  if (isBuyer) {
    contractData.buyerSignature = parsed.data.signature;
    contractData.buyerSignedAt = now;
  } else {
    contractData.sellerSignature = parsed.data.signature;
    contractData.sellerSignedAt = now;
  }

  await prisma.deal.update({
    where: { id },
    data: { contractData: JSON.stringify(contractData) },
  });

  // 상대방에게 알림
  const otherId = isBuyer ? deal.sellerId : deal.buyerId;
  await notify(otherId, "CHAT_MESSAGE", {
    dealId: id,
    preview: `${isBuyer ? "매수인" : "매도인"}이 전자서명을 완료했습니다.`,
  });

  return NextResponse.json({ ok: true, signedAt: now });
}
