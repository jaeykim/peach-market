import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const listingCount = await prisma.listing.count({
    where: { status: { not: "CLOSED" }, dealType: "MONTHLY" },
  });

  return (
    <div className="bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🍑</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            학생과 집주인이 <br />
            <span className="text-pink-600">직접 만나는 대학가 월세</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            중개 수수료 없이, 복비 없이.
            <br className="hidden sm:block" />
            매물 검증·비공개 협상·계약서까지 피치마켓이 무료로 도와드려요.
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/map"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-lg text-sm sm:text-base"
            >
              🔍 방 찾기
            </Link>
            <Link
              href="/listings/new"
              className="bg-white border-2 border-pink-600 text-pink-600 font-bold px-6 py-3 rounded-lg text-sm sm:text-base hover:bg-pink-50"
            >
              🏠 내 방 올리기
            </Link>
          </div>
          <div className="mt-10 flex justify-center gap-8 text-sm text-neutral-500">
            <Stat n={listingCount} label="등록 매물" />
            <Stat n={0} label="중개 수수료" suffix="원" />
            <Stat n={9} label="주요 대학가" suffix="곳" />
          </div>
        </div>
      </section>

      {/* Target */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            이런 분들을 위한 서비스예요
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            <TargetCard
              icon="🎓"
              title="학생 · 신입생 · 인턴"
              lines={[
                "첫 자취, 계약이 어려우신가요?",
                "방학 3개월만 머물 방이 필요하신가요?",
                "복비가 부담되시나요?",
              ]}
              cta="방 찾기"
              href="/map"
            />
            <TargetCard
              icon="🏠"
              title="대학가 집주인"
              lines={[
                "빈 방 광고비가 아까우신가요?",
                "기존 세입자가 갑자기 나가시나요?",
                "중개사를 거치지 않고 직접 만나고 싶으신가요?",
              ]}
              cta="내 방 올리기"
              href="/listings/new"
            />
          </div>
        </div>
      </section>

      {/* 3 types */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            3가지 계약 유형을 지원해요
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            학생 생활에 맞는 유연한 계약
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-10">
            <TypeCard
              icon="🗓️"
              title="월세"
              desc="보통 1~2년 단위. 보증금 + 월세. 가장 일반적인 학생 계약."
              tags={["1-2년", "보증금 낮음", "풀옵션"]}
            />
            <TypeCard
              icon="⏳"
              title="단기임대"
              desc="방학·교환학생·인턴십 기간만. 3~6개월 단위로 유연하게."
              tags={["3-6개월", "방학 단기", "인턴·교환"]}
              highlight
            />
            <TypeCard
              icon="↪️"
              title="전대"
              desc="기존 세입자가 남은 계약 기간 동안 다른 사람에게 빌려주는 방식."
              tags={["잔여 기간", "즉시 입주", "원계약 승계"]}
            />
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            왜 피치마켓인가요?
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            <Card
              icon="💸"
              title="중개수수료 0원"
              desc="복비·광고비 부담 없이 집주인과 학생이 직접 만납니다."
            />
            <Card
              icon="🔒"
              title="안전한 매물 검증"
              desc="등기부등본·권리관계를 자동으로 확인하고 사기 매물을 거릅니다."
            />
            <Card
              icon="📄"
              title="표준 계약서 자동 작성"
              desc="국토부 표준 양식으로 전월세 계약서를 자동 생성, 전자서명으로 바로 체결."
            />
          </div>
        </div>
      </section>

      {/* University hotspots */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            주요 대학가 매물
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            9개 주요 대학가에서 바로 방을 찾아보세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              "연세대 · 신촌",
              "이화여대",
              "홍익대",
              "고려대 · 안암",
              "서울대 · 관악",
              "한양대 · 왕십리",
              "성균관대 · 혜화",
              "건국대 · 건대입구",
              "합정 · 망원",
            ].map((u) => (
              <span
                key={u}
                className="bg-white border rounded-full px-4 py-2 text-sm font-semibold text-neutral-700"
              >
                {u}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            이렇게 진행돼요
          </h2>
          <ol className="mt-10 space-y-3">
            {[
              ["1", "지도에서 방 찾기", "대학가 중심 지도 + 필터로 빠르게 탐색"],
              ["2", "비공개 가격 제안", "학생이 집주인에게 월세·보증금 제안 (다른 학생에겐 비공개)"],
              ["3", "집주인 수락", "집주인이 수락하면 딜 성사"],
              ["4", "등기부 자동 확인", "권리관계·사기 리스크 자동 검증"],
              ["5", "표준 계약서 자동 생성", "AI가 국토부 양식으로 계약서 작성"],
              ["6", "전자서명 + 에스크로", "양측 서명 후 보증금 안전 보관"],
              ["7", "입주 완료", "끝! 중개수수료 0원"],
            ].map(([n, title, desc]) => (
              <li
                key={n}
                className="border rounded-lg p-4 bg-neutral-50 flex gap-3"
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

      {/* CTA */}
      <section className="bg-pink-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">
            첫 자취, 복비 없이 시작하세요
          </h2>
          <p className="mt-3 text-pink-100 text-sm">
            가입 무료, 검색 무료, 계약까지 무료.
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
              방 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-900 text-neutral-400 text-xs py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>🍑 피치마켓 © 2026 — 대학가 월세 · 단기 · 전대</div>
          <div className="flex gap-3">
            <Link href="/map" className="hover:text-white">
              방 찾기
            </Link>
            <Link href="/listings/new" className="hover:text-white">
              방 올리기
            </Link>
            <Link href="/login" className="hover:text-white">
              로그인
            </Link>
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

function TargetCard({
  icon,
  title,
  lines,
  cta,
  href,
}: {
  icon: string;
  title: string;
  lines: string[];
  cta: string;
  href: string;
}) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <ul className="space-y-1 text-sm text-neutral-600">
        {lines.map((l) => (
          <li key={l}>· {l}</li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-4 inline-block bg-pink-600 text-white text-sm font-bold px-4 py-2 rounded"
      >
        {cta} →
      </Link>
    </div>
  );
}

function TypeCard({
  icon,
  title,
  desc,
  tags,
  highlight,
}: {
  icon: string;
  title: string;
  desc: string;
  tags: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl p-6 bg-white ${
        highlight ? "border-pink-500 border-2 shadow-lg" : ""
      }`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-neutral-600 mt-2">{desc}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
