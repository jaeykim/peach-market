import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 매물 정보를 기반으로 AI가 적정가를 추정.
// API 키가 없으면 단순 휴리스틱(평당가 × 면적)으로 fallback.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "매물 없음" }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback heuristic (단위: 만원)
    const area = listing.areaExclusive ?? 60;
    const pricePerM2Man = listing.dealType === "SALE" ? 1_200 : 500; // 만원/㎡
    const estimate = Math.round(area * pricePerM2Man);
    return NextResponse.json({
      estimate,
      low: Math.round(estimate * 0.92),
      high: Math.round(estimate * 1.08),
      source: "heuristic",
      reasoning: "Anthropic API 키가 설정되지 않아 단순 면적 기반으로 추정했습니다.",
    });
  }

  const client = new Anthropic({ apiKey });
  const prompt = `당신은 한국 부동산 시장의 적정가를 산정하는 전문가입니다. 다음 매물 정보를 보고 적정 가격(만원 단위)을 추정해주세요.

[매물 정보]
- 주소: ${listing.address}
- 종류: ${listing.propertyType}
- 거래 유형: ${listing.dealType} (SALE=매매, JEONSE=전세, MONTHLY=월세)
- 전용면적: ${listing.areaExclusive ?? "미상"}㎡
- 공급면적: ${listing.areaSupply ?? "미상"}㎡
- 층: ${listing.floor ?? "?"}/${listing.totalFloors ?? "?"}
- 방향: ${listing.direction ?? "미상"}
- 준공: ${listing.builtYear ?? "미상"}년
- 방/욕실: ${listing.rooms ?? "?"}/${listing.bathrooms ?? "?"}
- 관리비: ${listing.maintenanceFee ?? 0}원
- 등록 가격: ${listing.askingPrice}만원

다음 JSON만 반환하세요(설명 텍스트 금지). 모든 가격은 "만원" 단위 정수입니다:
{"estimate": <만원>, "low": <만원>, "high": <만원>, "reasoning": "<2-3문장 한국어>"}`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI 응답 파싱 실패");
    const parsed = JSON.parse(match[0]);
    return NextResponse.json({ ...parsed, source: "ai" });
  } catch (err) {
    return NextResponse.json(
      { error: "AI 적정가 산정 실패", detail: String(err) },
      { status: 500 },
    );
  }
}
