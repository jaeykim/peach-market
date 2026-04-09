import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Body = z.object({ query: z.string().min(1).max(300) });

// 자연어 매물 검색 (고도화)
// - Claude Sonnet으로 사용자 의도를 구조화 해석
// - 매물별 다차원 매칭 + 사유 + 매칭된 기준 라벨
// - 결과: { interpretation, criteria, matches }
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "검색어가 필요합니다." }, { status: 400 });
  }
  const { query } = parsed.data;

  const listings = await prisma.listing.findMany({
    where: { status: { not: "CLOSED" } },
    select: {
      id: true,
      side: true,
      title: true,
      address: true,
      propertyType: true,
      dealType: true,
      areaExclusive: true,
      floor: true,
      totalFloors: true,
      builtYear: true,
      rooms: true,
      askingPrice: true,
      deposit: true,
      description: true,
    },
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const tokens = query.split(/\s+/).filter(Boolean);
    const matches = listings
      .map((l) => {
        const hay = `${l.title} ${l.address} ${l.description ?? ""} ${l.propertyType}`.toLowerCase();
        const score = tokens.filter((t) => hay.includes(t.toLowerCase())).length * 25;
        return {
          id: l.id,
          score,
          reason: score > 0 ? "키워드 매칭" : "",
          matchedCriteria: [] as string[],
        };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
    return NextResponse.json({
      interpretation: `키워드 검색: ${query}`,
      criteria: tokens,
      matches,
      source: "keyword",
    });
  }

  const client = new Anthropic({ apiKey });
  const compact = listings.map((l) => ({
    id: l.id,
    side: l.side === "SELL" ? "매도" : "매수",
    title: l.title,
    address: l.address,
    type: l.propertyType,
    deal: l.dealType,
    area_m2: l.areaExclusive,
    floor: l.floor && l.totalFloors ? `${l.floor}/${l.totalFloors}` : null,
    built: l.builtYear,
    rooms: l.rooms,
    price_man: l.askingPrice,
    deposit_man: l.deposit,
    desc: l.description,
  }));

  const systemPrompt = `당신은 한국 부동산 시장에 정통한 매물 검색 전문가입니다. 사용자가 자연어로 표현한 모호한 요구사항(예: "한강뷰 고급빌라", "재개발 가능성 높은 곳", "학군 좋은 동네", "1급지 상가")을 정확히 해석하고, 주어진 매물 풀에서 가장 잘 맞는 매물을 골라주세요.

판단 시 활용 가능한 한국 부동산 업계 용어/상식:

[주거]
- 1군 단지/프리미엄 주거지: 강남구·서초구·송파구·용산구·성동구 성수, 마포구 일부
- 학군 강세: 강남구 대치동·도곡동, 양천구 목동, 노원구 중계동, 분당
- 한강 인접: 마포구·용산구·성동구·광진구·송파구·영등포구 여의도
- 재개발/재건축 후보: 노원·도봉·강북·관악·동작 일부 노후 단지, 압구정·여의도·목동
- 고급 빌라/고급 주거: 한남동·청담동·평창동·성북동·이태원·삼청동

[상업/투자] 상가는 "급지" 개념을 씁니다 (군지 X, 급지 O):
- 1급지 (A급): 메인 상권 핵심 입지. 유동인구 최상, 권리금/임대료 최고. 예) 강남역·명동·홍대 정문·가로수길·이태원·강북 노원역·잠실역
- 2급지 (B급): 1급지 인접 또는 부도심 중심. 예) 강남역 이면도로·종로·신림·건대·서울대입구·합정
- 3급지 (C급): 동네 상권/이면 골목. 유동인구 중하, 임대료 낮음
- 권리금·MD·MD구성 등 상가 특화 용어

[기타]
- 역세권: 9호선·2호선·신분당선·신림선 등
- 지식산업센터 핫스팟: 성수·문정·가산·영등포·구로
- 꼬마빌딩 투자: 강남·성수·홍대·이태원·서촌·연남
- 수익률(임대수익률) 4%+ 이면 양호

사용자의 표현이 모호하면 추론하세요. "1군지/2군지" 같은 비공식 표현이 들어와도 의도를 파악해 1급지/2급지로 매핑하세요. 매물 데이터에 명시되지 않은 가치(조망/학군/투자/입지/상권)도 주소·면적·종류·연식·설명에서 합리적으로 유추하세요.`;

  const userPrompt = `검색어: "${query}"

매물 목록:
${JSON.stringify(compact)}

다음 JSON만 반환하세요(설명/마크다운 금지):
{
  "interpretation": "<사용자가 찾는 것을 1-2문장으로 명확히 정리>",
  "criteria": ["<핵심 판단 기준 라벨 3-5개, 각각 4-8자>"],
  "matches": [
    {
      "id": "<listing id>",
      "score": <0-100 정수>,
      "reason": "<왜 매칭되는지 15자 이내 한국어>",
      "matchedCriteria": ["<criteria 배열에 정의한 라벨 중 매칭된 것들>"]
    }
  ]
}

규칙:
- score 60 미만은 결과에서 제외
- 점수는 객관적이고 차별화되게 (전부 90점 금지)
- matches는 score 내림차순 정렬
- reason은 구체적 근거 (예: "용산 한강 도보 5분", "강남 학군지 84㎡")`;

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = msg.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("AI 응답 파싱 실패");
    const out = JSON.parse(m[0]);
    return NextResponse.json({
      interpretation: out.interpretation || "",
      criteria: out.criteria || [],
      matches: (out.matches || []).sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) => (b.score || 0) - (a.score || 0),
      ),
      source: "ai",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "AI 검색 실패", detail: String(err) },
      { status: 500 },
    );
  }
}
