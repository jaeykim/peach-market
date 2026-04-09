import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  reason: z.enum(["FAKE", "SCAM", "WRONG_INFO", "OTHER"]),
  detail: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "매물 없음" }, { status: 404 });
  if (listing.ownerId === user.id) {
    return NextResponse.json({ error: "본인 매물은 신고할 수 없습니다." }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      listingId: id,
      reporterId: user.id,
      reason: parsed.data.reason,
      detail: parsed.data.detail,
    },
  });
  return NextResponse.json({ report });
}
