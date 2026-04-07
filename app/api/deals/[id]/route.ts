import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 딜 조회: 당사자만 접근 가능. 계약 준비를 위해 양측 연락처/이름 노출.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true, email: true, phone: true } },
      seller: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  return NextResponse.json({ deal });
}

const Patch = z.object({
  contractData: z.object({
    closingDate: z.string().optional(),       // 잔금일
    downPayment: z.number().int().optional(), // 계약금
    midPayment: z.number().int().optional(),  // 중도금
    finalPayment: z.number().int().optional(),// 잔금
    specialTerms: z.string().optional(),      // 특약
  }),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return NextResponse.json({ error: "딜 없음" }, { status: 404 });
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  // 기존 데이터와 병합
  const existing = deal.contractData ? JSON.parse(deal.contractData) : {};
  const merged = { ...existing, ...parsed.data.contractData };

  const updated = await prisma.deal.update({
    where: { id },
    data: { contractData: JSON.stringify(merged), status: "CONTRACT_READY" },
  });
  return NextResponse.json({ deal: updated });
}
