import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 매물 소유권 검증: 등기부 소유자 이름 vs 등록자 실명 대조
// 데모: Claude가 listing.owner.name과 "등기부상 소유자"를 시뮬레이션해 일치 여부 판단
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, verifiedAt: true, residentNumber: true } },
    },
  });
  if (!listing) return NextResponse.json({ error: "매물 없음" }, { status: 404 });
  // 매물 소유자 본인만 검증 요청 가능
  if (listing.ownerId !== user.id) {
    return NextResponse.json(
      { error: "매물 등록자만 소유권 검증을 요청할 수 있습니다." },
      { status: 403 },
    );
  }

  // 1단계: 본인 인증 필수
  if (!listing.owner.verifiedAt) {
    return NextResponse.json(
      { error: "먼저 본인 인증(PASS)을 완료해주세요." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // 데모용: registry를 시뮬레이션 (실서비스에선 인터넷등기소 API 호출)
  // 80% 확률로 매칭되도록 가짜로 만듦
  let registryOwnerName = listing.owner.name;
  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `당신은 한국 등기부등본을 시뮬레이션합니다. 주어진 매물의 등기부상 소유자 이름을 반환하세요. 80% 확률로 입력된 등록자와 동일하게, 20% 확률로 다른 한국식 이름을 반환하세요.

매물 주소: ${listing.address}
등록자 실명: ${listing.owner.name}

JSON 형식으로만 응답:
{"registryOwner": "<이름>", "note": "<한 줄 코멘트>"}`,
          },
        ],
      });
      const text = msg.content
        .filter((c): c is Anthropic.TextBlock => c.type === "text")
        .map((c) => c.text)
        .join("");
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        if (parsed.registryOwner) registryOwnerName = parsed.registryOwner;
      }
    } catch {
      // 실패 시 fallback: 등록자 이름 그대로
    }
  }

  const matched = registryOwnerName === listing.owner.name;

  const checkResult = {
    registryOwner: registryOwnerName,
    listingOwner: listing.owner.name,
    matched,
    checkedAt: new Date().toISOString(),
  };

  const updated = await prisma.listing.update({
    where: { id },
    data: {
      ownershipVerifiedAt: matched ? new Date() : null,
      ownershipCheckResult: JSON.stringify(checkResult),
    },
  });

  return NextResponse.json({
    matched,
    registryOwner: registryOwnerName,
    listingOwner: listing.owner.name,
    verifiedAt: updated.ownershipVerifiedAt,
  });
}
