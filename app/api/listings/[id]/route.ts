import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 매물 상세 (공개 정보)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
    },
  });
  if (!listing) return NextResponse.json({ error: "매물을 찾을 수 없습니다." }, { status: 404 });

  // 소유자 연락처는 비공개. 비드 정보도 여기서는 노출 X
  return NextResponse.json({ listing });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.ownerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  await prisma.listing.update({ where: { id }, data: { status: "CLOSED" } });
  return NextResponse.json({ ok: true });
}
