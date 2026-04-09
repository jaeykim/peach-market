import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

// 시장 인사이트: 지역×종류별 평균/최저/최고/매물수 + AI 코멘트
export async function GET() {
  const listings = await prisma.listing.findMany({
    where: { status: { not: "CLOSED" } },
    select: {
      id: true,
      address: true,
      propertyType: true,
      dealType: true,
      askingPrice: true,
      areaExclusive: true,
    },
  });

  // 지역(구) × 거래유형 그룹
  const groups: Record<string, { region: string; dealType: string; prices: number[]; count: number }> = {};
  for (const l of listings) {
    const m = l.address.match(/([가-힣]+구|[가-힣]+군|[가-힣]+시)\s/);
    const region = m ? m[1] : "기타";
    const key = `${region}|${l.dealType}`;
    if (!groups[key]) groups[key] = { region, dealType: l.dealType, prices: [], count: 0 };
    groups[key].prices.push(l.askingPrice);
    groups[key].count += 1;
  }

  const stats = Object.values(groups)
    .map((g) => {
      const sorted = [...g.prices].sort((a, b) => a - b);
      const avg = Math.round(g.prices.reduce((s, x) => s + x, 0) / g.prices.length);
      const median = sorted[Math.floor(sorted.length / 2)];
      return {
        region: g.region,
        dealType: g.dealType,
        count: g.count,
        avg,
        median,
        min: sorted[0],
        max: sorted[sorted.length - 1],
      };
    })
    .sort((a, b) => b.count - a.count);

  // 종류별 통계
  const byType: Record<string, { count: number; avg: number }> = {};
  const tmp: Record<string, number[]> = {};
  for (const l of listings) {
    if (!tmp[l.propertyType]) tmp[l.propertyType] = [];
    tmp[l.propertyType].push(l.askingPrice);
  }
  for (const [k, v] of Object.entries(tmp)) {
    byType[k] = {
      count: v.length,
      avg: Math.round(v.reduce((s, x) => s + x, 0) / v.length),
    };
  }

  let aiInsight = "";
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && stats.length > 0) {
    try {
      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: `당신은 한국 부동산 시장 분석가입니다. 아래 피치마켓의 매물 통계를 보고 시장 인사이트를 3-4문단(각 2-3문장)으로 작성해주세요. 한국어, markdown 없이 일반 텍스트.

지역×거래유형 통계 (가격은 만원):
${JSON.stringify(stats.slice(0, 10))}

매물 종류별 통계:
${JSON.stringify(byType)}

내용에 포함할 것:
1. 가장 활발한 지역/거래유형
2. 가격대 비교 (강남권 vs 다른 지역)
3. 주목할 만한 패턴이나 기회
4. 실수요자/투자자에 대한 짧은 조언`,
          },
        ],
      });
      aiInsight = msg.content
        .filter((c): c is Anthropic.TextBlock => c.type === "text")
        .map((c) => c.text)
        .join("");
    } catch {
      aiInsight = "";
    }
  }

  return NextResponse.json({
    totalListings: listings.length,
    stats,
    byType,
    aiInsight,
  });
}
