import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 등기부등본 자동 조회 (Mock)
// 실제로는 인터넷등기소 API(IROS) 또는 정부24를 통해 발급해야 합니다.
// 데모: AI가 매물 정보 기반으로 그럴듯한 등기부 요약을 생성.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { name: true } } },
  });
  if (!listing) return NextResponse.json({ error: "매물 없음" }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // 단순 fallback
    return NextResponse.json({
      source: "mock",
      issuedAt: new Date().toISOString(),
      property: {
        address: listing.address + (listing.addressDetail ? ` ${listing.addressDetail}` : ""),
        type: listing.propertyType,
        area: listing.areaExclusive,
      },
      owner: { name: listing.owner.name, idMasked: "******-*******" },
      encumbrances: [],
      transactions: [],
      warnings: ["⚠️ 데모 환경 — 실제 등기부 데이터가 아닙니다."],
      summary: "등기부등본 데모 응답입니다. 실제 거래 시 인터넷등기소(IROS)에서 발급받아주세요.",
    });
  }

  const client = new Anthropic({ apiKey });
  const prompt = `당신은 한국 부동산 등기부등본을 시뮬레이션하는 시스템입니다. 아래 매물 정보를 바탕으로 실제 등기부등본과 유사한 구조로 가짜 데이터를 생성하세요. (실제 데이터가 아니며 데모용입니다.)

[매물 정보]
주소: ${listing.address} ${listing.addressDetail ?? ""}
종류: ${listing.propertyType}
면적: ${listing.areaExclusive ?? "?"}㎡
연식: ${listing.builtYear ?? "?"}년
층: ${listing.floor ?? "?"}/${listing.totalFloors ?? "?"}
거래유형: ${listing.dealType}
희망가: ${listing.askingPrice}만원
등록자: ${listing.owner.name}

다음 JSON 형식으로만 응답하세요(설명 금지). 한국 등기부등본의 표제부/갑구/을구 구조를 본떠서, 매물 종류·연식·지역·가격에 맞춰 그럴듯하게 채워주세요. 일부 매물은 의도적으로 위험 요소(가압류·근저당 과다·소액 임차인 등)를 포함시켜 사용자가 검증의 가치를 느낄 수 있게 해주세요.

{
  "issuedAt": "<ISO 시각>",
  "property": {
    "address": "<주소>",
    "buildingName": "<건물명 또는 null>",
    "lotNumber": "<지번>",
    "structure": "<예: 철근콘크리트구조 슬래브지붕>",
    "totalArea": <㎡>,
    "exclusiveArea": <㎡>,
    "registeredAt": "<YYYY-MM-DD>"
  },
  "owner": {
    "name": "<소유자명, 등록자와 일치 권장>",
    "idMasked": "<예: 850315-1******>",
    "acquiredAt": "<YYYY-MM-DD>",
    "acquireReason": "<예: 매매·증여·상속>"
  },
  "encumbrances": [
    {"type": "근저당권", "creditor": "<은행명>", "amount_man": <만원>, "registeredAt": "<YYYY-MM-DD>", "status": "<유효/말소>"},
    {"type": "가압류", "creditor": "<채권자>", "amount_man": <만원>, "registeredAt": "<YYYY-MM-DD>", "status": "<유효/말소>"}
  ],
  "transactions": [
    {"date": "<YYYY-MM-DD>", "type": "소유권이전", "from": "<이름>", "to": "<이름>", "price_man": <만원>}
  ],
  "warnings": ["<자동 분석 경고 한 줄, 0-3개>"],
  "riskScore": <0-100 정수, 높을수록 위험>,
  "summary": "<2-3문장 한국어 요약>"
}`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("AI 응답 파싱 실패");
    const out = JSON.parse(m[0]);
    return NextResponse.json({ ...out, source: "mock-ai" });
  } catch (err) {
    return NextResponse.json(
      { error: "등기부 조회 실패", detail: String(err) },
      { status: 500 },
    );
  }
}
