import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const Body = z.object({
  address: z.string(),
  propertyType: z.string(),
  dealType: z.enum(["SALE", "JEONSE", "MONTHLY"]),
  areaExclusive: z.number().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  builtYear: z.number().int().optional(),
  rooms: z.number().int().optional(),
});

// 매물 등록 폼 입력값으로부터 AI가 적정가를 추정.
// API 키가 없으면 단순 휴리스틱으로 fallback.
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  }
  const data = parsed.data;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const area = data.areaExclusive ?? 60;
    const pricePerM2Man = data.dealType === "SALE" ? 1_200 : 500;
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
- 주소: ${data.address}
- 종류: ${data.propertyType}
- 거래 유형: ${data.dealType} (SALE=매매, JEONSE=전세, MONTHLY=월세)
- 전용면적: ${data.areaExclusive ?? "미상"}㎡
- 층: ${data.floor ?? "?"}/${data.totalFloors ?? "?"}
- 준공: ${data.builtYear ?? "미상"}년
- 방: ${data.rooms ?? "?"}

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
    const out = JSON.parse(match[0]);
    return NextResponse.json({ ...out, source: "ai" });
  } catch (err) {
    return NextResponse.json(
      { error: "AI 적정가 산정 실패", detail: String(err) },
      { status: 500 },
    );
  }
}
