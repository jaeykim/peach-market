import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
    },
  });
  if (!listing) return NextResponse.json({ error: "매물을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ listing });
}

const PatchBody = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  askingPrice: z.number().int().nonnegative().optional(),
  deposit: z.number().int().nonnegative().optional(),
  areaExclusive: z.number().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  builtYear: z.number().int().optional(),
  rooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  isShortTerm: z.boolean().optional(),
  rentalMonths: z.number().int().nullable().optional(),
  photos: z.string().optional(),
  status: z.enum(["OPEN", "PAUSED", "CLOSED"]).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.ownerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  const parsed = PatchBody.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  }
  const updated = await prisma.listing.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ listing: updated });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.ownerId !== user.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  // 진행중인 딜이 있는지 체크
  const activeDeals = await prisma.deal.count({
    where: { listingId: id, status: { in: ["AGREED", "CONTRACT_READY"] } },
  });
  if (activeDeals > 0) {
    return NextResponse.json(
      { error: "진행 중인 거래가 있어 삭제할 수 없습니다. 일시중지를 사용해주세요." },
      { status: 400 },
    );
  }
  await prisma.listing.update({ where: { id }, data: { status: "CLOSED" } });
  return NextResponse.json({ ok: true });
}
