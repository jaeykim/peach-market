import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [listingCount, dealCount] = await Promise.all([
    prisma.listing.count({ where: { status: { not: "CLOSED" } } }),
    prisma.deal.count(),
  ]);

  return (
    <div className="bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🍑</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            투명한 정보, 직접 협상,
            <br />
            <span className="text-pink-600">합리적인 부동산 거래</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            피치마켓은 매도자와 매수자가 직접 만나는 부동산 플랫폼입니다.
            <br className="hidden sm:block" />
            정보는 투명하게, 협상은 비공개로, 마무리는 자동화로.
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/map"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-lg text-sm sm:text-base"
            >
              🔍 매물 둘러보기
            </Link>
            <Link
              href="/listings/new"
              className="bg-white border-2 border-pink-600 text-pink-600 font-bold px-6 py-3 rounded-lg text-sm sm:text-base hover:bg-pink-50"
            >
              + 매물 등록
            </Link>
          </div>
          <div className="mt-10 flex justify-center gap-8 text-sm text-neutral-500">
            <Stat n={listingCount} label="등록 매물" />
            <Stat n={dealCount} label="성사 거래" />
            <Stat n={50} label="평균 수수료 절감" suffix="%" />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            왜 피치마켓인가요?
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            &lsquo;레몬마켓&rsquo;의 반대 — 정보가 투명한 시장을 만듭니다.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            <Card
              icon="🔍"
              title="투명한 정보 공개"
              desc="매물 정보·등기부·시세를 모두 한 자리에서 확인하세요. 숨겨진 권리관계도 자동 분석합니다."
            />
            <Card
              icon="🔒"
              title="비공개 1:1 협상"
              desc="가격 협상은 매도자·매수자 두 사람만 봅니다. 다른 매수자의 비드 금액은 절대 노출되지 않습니다."
            />
            <Card
              icon="✨"
              title="AI가 도와주는 거래"
              desc="자연어로 매물을 찾고, AI가 적정가를 추천하고, 표준 계약서를 자동 생성합니다."
            />
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            거래 방식을 직접 고르세요
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            자신감과 편안함의 균형을, 사용자가 직접 선택합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            <Tier
              name="🤝 직거래"
              price="0원"
              priceDesc="중개수수료 없음"
              desc="검색·협상·등기부 조회·계약서 초안까지 모두 무료. 셀프로 마무리하실 분께."
              features={[
                "지도·AI 검색·필터 무료",
                "비공개 비딩·협상 무료",
                "등기부등본 자동 분석",
                "AI 적정가 추천",
              ]}
            />
            <Tier
              name="📦 자동화 패키지"
              price="5만원"
              priceDesc="거래 1건당"
              desc="전자서명 + 표준 계약서 PDF + 거래신고 + 잔금 캘린더까지 한 번에."
              features={[
                "AI 표준 계약서 정식 발급",
                "전자서명 (모두싸인 연동)",
                "거래신고서 자동 작성",
                "법무사 매칭 (등기 이전)",
              ]}
              highlight
            />
            <Tier
              name="⚖️ 중개사 검토"
              price="0.2~0.3%"
              priceDesc="시중 0.5% 대비 절반"
              desc="공인중개사가 권리관계·계약서·거래 전체를 검토·서명·책임집니다. 안심 거래."
              features={[
                "지역 전문 공인중개사 자동 매칭",
                "권리관계 정밀 검토",
                "현장 확인 + 중개대상물 확인설명서",
                "손해배상 책임 보험 포함",
              ]}
            />
          </div>
          <p className="text-xs text-neutral-500 text-center mt-6">
            ※ 모든 옵션에서 매물 검색·등록·협상은 무료입니다. 거래 마무리 단계에서 원하는 방식을 선택하세요.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">핵심 기능</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-10">
            <Feature
              tag="MAP"
              title="네이버 지도 기반 매물 탐색"
              desc="14개 카테고리, 지역·가격·면적·보증금 다중 필터로 원하는 매물을 한 눈에."
            />
            <Feature
              tag="AI SEARCH"
              title="자연어 매물 검색"
              desc='"한강뷰 고급빌라", "1급지 상가", "재개발 가능성 높은 곳" — 느낌으로 찾아도 AI가 정확히 이해합니다.'
            />
            <Feature
              tag="P2P"
              title="비공개 비딩"
              desc="매수자가 가격 제안 → 매도자가 수락/거절/카운터. 카운터오퍼 체인 지원, 다른 사용자에겐 비공개."
            />
            <Feature
              tag="✨ AI"
              title="AI 적정가 추천"
              desc="매물 정보를 입력하면 Claude가 적정 가격대를 즉시 추천합니다. 등록·비딩 양쪽에서 사용 가능."
            />
            <Feature
              tag="📜 LEGAL"
              title="등기부등본 자동 분석"
              desc="권리관계·근저당·가압류·거래이력을 자동 분석하고 리스크 점수를 표시합니다."
            />
            <Feature
              tag="📄 LEGAL"
              title="표준 계약서 자동 생성"
              desc="딜 성사 시 국토부 표준 양식의 매매·전세·월세 계약서를 AI가 자동으로 작성합니다."
            />
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            매칭부터 등기까지, 9단계
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            대부분의 단계를 자동화하고, 검토·서명 같은 전문 영역은 중개사 또는 본인이 선택합니다.
          </p>
          <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["1", "매물 등록 & 검색", "지도 + AI 검색"],
              ["2", "비공개 비딩", "당사자만 보는 협상"],
              ["3", "본인 인증", "PASS/NICE 실명 확인"],
              ["4", "등기부 자동 검증", "권리관계·리스크 분석"],
              ["5", "표준 계약서 생성", "AI가 자동 작성"],
              ["6", "검토·서명", "중개사 검토 또는 셀프"],
              ["7", "에스크로 입금", "은행 가상계좌"],
              ["8", "법무사 매칭 + 등기 이전", "검증된 풀에서 자동 배정"],
              ["9", "거래 완료", "세금 신고 안내"],
            ].map(([n, title, desc]) => (
              <li
                key={n}
                className="border rounded-lg p-4 bg-white flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {n}
                </div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* For Brokers */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center">
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              FOR LICENSED BROKERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3">
              공인중개사 파트너님께
            </h2>
            <p className="text-sm text-neutral-600 mt-2 max-w-2xl mx-auto">
              매물 자료 정리·시세·등기부·계약서 초안 같은 사전 준비를 피치마켓이 도와드립니다.
              <br />
              중개사님은 <strong>검토와 상담, 전문 판단</strong>에 더 집중하세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                href="/brokers"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
              >
                중개사 파트너 안내
              </Link>
            </div>
            <p className="text-[11px] text-neutral-500 mt-3">
              로톡(LawTalk)의 부동산 버전 · 헌법재판소 합헌 모델 기반
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-pink-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">
            지금 바로 시작하세요
          </h2>
          <p className="mt-3 text-pink-100 text-sm">
            가입과 매물 검색·협상은 무료. 거래 방식은 직접 고르세요.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link
              href="/signup"
              className="bg-white text-pink-600 font-bold px-6 py-3 rounded-lg"
            >
              회원가입
            </Link>
            <Link
              href="/map"
              className="bg-pink-700 hover:bg-pink-800 text-white font-bold px-6 py-3 rounded-lg border border-pink-400"
            >
              매물 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-900 text-neutral-400 text-xs py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>🍑 피치마켓 © 2026 — 투명한 부동산 거래 플랫폼</div>
          <div className="flex gap-3">
            <Link href="/map" className="hover:text-white">매물</Link>
            <Link href="/listings/new" className="hover:text-white">등록</Link>
            <Link href="/brokers" className="hover:text-white">중개사 파트너</Link>
            <Link href="/login" className="hover:text-white">로그인</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label, suffix }: { n: number; label: string; suffix?: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-pink-600">
        {n.toLocaleString()}
        {suffix}
      </div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function Card({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="border rounded-lg p-6 bg-neutral-50">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-neutral-600">{desc}</p>
    </div>
  );
}

function Feature({
  tag,
  title,
  desc,
}: {
  tag: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="border rounded-lg bg-white p-5">
      <span className="inline-block text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded mb-2">
        {tag}
      </span>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-neutral-600 mt-1">{desc}</p>
    </div>
  );
}

function Tier({
  name,
  price,
  priceDesc,
  desc,
  features,
  highlight,
}: {
  name: string;
  price: string;
  priceDesc: string;
  desc: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-6 bg-white ${
        highlight ? "border-pink-500 border-2 shadow-lg" : ""
      }`}
    >
      <h3 className="font-bold text-lg">{name}</h3>
      <div className="mt-3">
        <div className="text-3xl font-bold text-pink-600">{price}</div>
        <div className="text-xs text-neutral-500">{priceDesc}</div>
      </div>
      <p className="text-sm text-neutral-600 mt-3">{desc}</p>
      <ul className="mt-4 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="text-xs text-neutral-700 flex gap-1.5">
            <span className="text-pink-600">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
