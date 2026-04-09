import TaxCalculator from "@/components/TaxCalculator";

export const dynamic = "force-dynamic";

const PROP_LABEL: Record<string, string> = {
  APT: "아파트",
  OFFICETEL: "오피스텔",
  VILLA: "빌라/연립",
  HOUSE: "단독주택",
  MULTI_FAMILY: "다가구주택",
  STUDIO: "원룸/투룸",
  SHOP: "상가",
  OFFICE: "사무실",
  KNOWLEDGE: "지식산업센터",
  BUILDING: "건물(꼬마빌딩)",
  FACTORY: "공장",
  WAREHOUSE: "창고",
  LODGING: "숙박시설",
  LAND: "토지",
};

const DEAL_LABEL: Record<string, string> = {
  SALE: "매매",
  JEONSE: "전세",
  MONTHLY: "월세",
};

function formatMan(n: number): string {
  if (n >= 10_000) {
    const eok = Math.floor(n / 10_000);
    const rest = n % 10_000;
    return rest ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${n.toLocaleString()}만`;
}

export default async function InsightsPage() {
  // 자체 호출은 서버에서 직접 prisma 사용이 더 빠르지만, 일관성을 위해 fetch
  const res = await fetch(
    `http://localhost:${process.env.PORT || 3000}/api/insights`,
    { cache: "no-store" },
  );
  const data = await res.json();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">📊 시장 인사이트</h1>
        <p className="text-sm text-neutral-500 mt-1">
          피치마켓 등록 매물 {data.totalListings}건 기반 통계 + AI 분석
        </p>
      </header>

      {data.aiInsight && (
        <section className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
          <h2 className="font-bold mb-2 text-purple-900">🤖 AI 시장 분석</h2>
          <p className="text-sm whitespace-pre-wrap text-neutral-800">
            {data.aiInsight}
          </p>
        </section>
      )}

      <section>
        <h2 className="font-bold mb-2">지역별 시세 (Top 10)</h2>
        <div className="border rounded-lg bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs">
              <tr>
                <th className="text-left p-2">지역</th>
                <th className="text-left p-2">거래</th>
                <th className="text-right p-2">매물</th>
                <th className="text-right p-2">평균</th>
                <th className="text-right p-2">중간값</th>
                <th className="text-right p-2">최저</th>
                <th className="text-right p-2">최고</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.stats.map((s: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-semibold">{s.region}</td>
                  <td className="p-2">{DEAL_LABEL[s.dealType] || s.dealType}</td>
                  <td className="p-2 text-right">{s.count}건</td>
                  <td className="p-2 text-right font-bold">{formatMan(s.avg)}</td>
                  <td className="p-2 text-right">{formatMan(s.median)}</td>
                  <td className="p-2 text-right text-neutral-500">{formatMan(s.min)}</td>
                  <td className="p-2 text-right text-neutral-500">{formatMan(s.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-bold mb-2">매물 종류별</h2>
        <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-2">
          {Object.entries(data.byType as Record<string, { count: number; avg: number }>)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([k, v]) => (
              <div key={k} className="border rounded-lg bg-white p-3">
                <div className="text-xs text-neutral-500">
                  {PROP_LABEL[k] || k}
                </div>
                <div className="font-bold">{v.count}건</div>
                <div className="text-xs text-neutral-600">평균 {formatMan(v.avg)}</div>
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2 className="font-bold mb-2">💰 세금 계산기</h2>
        <TaxCalculator />
      </section>
    </div>
  );
}
