import Link from "next/link";
import { prisma } from "@/lib/db";
import RotatingTypeCards from "@/components/RotatingTypeCards";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const listingCount = await prisma.listing.count({
    where: { status: { in: ["OPEN", "IN_NEGOTIATION"] }, dealType: "MONTHLY" },
  });

  return (
    <div className="bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🍑</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            동네에서 만나는 <br />
            <span className="text-pink-600">수수료 0원 월세</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
            비싸지 않은 월세방, 짧게 머물 방, 복비 없이 만나고 싶은 분들을 위해.
            <br className="hidden sm:block" />
            작은 동네 커뮤니티처럼, 피치마켓이 계약서와 안전장치만 조용히 도와드려요.
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
            <Stat n={0} label="숨은 비용" suffix="원" />
          </div>
        </div>
      </section>

      {/* Desires */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            이런 고민, 있으신가요?
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            피치마켓이 처음부터 끝까지 무료로 해결해드려요.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            <DesireCard
              icon="💸"
              title="복비가 아까워요"
              desc="월세 1달치 넘는 중개수수료, 꼭 내야만 할까요? 직접 만나면 0원입니다."
            />
            <DesireCard
              icon="🔒"
              title="사기가 무서워요"
              desc="등기부·권리관계·집주인 신원을 피치마켓이 먼저 확인해드려요."
            />
            <DesireCard
              icon="📄"
              title="계약서 쓰는 법을 몰라요"
              desc="국토부 표준 임대차 계약서를 자동으로 작성해드려요. 전자서명으로 바로 체결."
            />
            <DesireCard
              icon="💰"
              title="보증금이 걱정돼요"
              desc="보증금은 피치마켓 에스크로에 안전하게 보관. 거래 완료 전까지 집주인에게 전달되지 않습니다."
            />
            <DesireCard
              icon="⏳"
              title="방학·단기만 필요해요"
              desc="3~6개월 단기임대, 교환학생·인턴십·프리랜서 모두 환영."
            />
            <DesireCard
              icon="↪️"
              title="갑자기 떠나게 됐어요"
              desc="남은 계약 기간을 전대로 넘기세요. 위약금 없이 자연스럽게."
            />
          </div>
          <div className="mt-10 flex gap-3 justify-center flex-wrap">
            <Link
              href="/map"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-3 rounded-lg"
            >
              🔍 방 찾기
            </Link>
            <Link
              href="/listings/new"
              className="bg-white border-2 border-pink-600 text-pink-600 font-bold px-6 py-3 rounded-lg hover:bg-pink-50"
            >
              🏠 방 올리기
            </Link>
          </div>
        </div>
      </section>

      {/* 3 types (rotating highlight) */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            어떤 계약이든, 무료로
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            월세 · 단기임대 · 전대 — 모두 피치마켓에서
          </p>
          <RotatingTypeCards />
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            다른 단기임대 플랫폼은요?
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            계약서 없이 몇 백만원을 주고받고 있으세요?
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <div className="border-2 border-neutral-200 rounded-xl p-6 bg-white opacity-80">
              <div className="text-xs font-bold text-neutral-500 mb-2">다른 단기임대 서비스</div>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex gap-2">
                  <span className="text-red-500">✕</span>
                  <span>수수료 10~20% (한 달치 월세)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">✕</span>
                  <span>정식 임대차 계약서 미작성</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">✕</span>
                  <span>보증금 예치 보호 없음</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">✕</span>
                  <span>분쟁 시 법적 근거 부족</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">✕</span>
                  <span>집주인 실명·등기부 검증 없음</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-pink-500 rounded-xl p-6 bg-white shadow-lg">
              <div className="text-xs font-bold text-pink-600 mb-2">🍑 피치마켓</div>
              <ul className="space-y-2 text-sm text-neutral-800">
                <li className="flex gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>
                    <strong>수수료 0원</strong> · 가입부터 계약까지 전부 무료
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>
                    <strong>국토부 표준 임대차 계약서</strong> 자동 작성
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>
                    <strong>보증금 에스크로</strong> 안전 보관
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>분쟁 시 계약서 + 전자서명 효력</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>
                    <strong>등기부·권리관계 자동 검증</strong>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-600">✓</span>
                  <span>
                    <strong>월세·단기임대 카드 결제</strong> 지원
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-500 mt-6">
            계약서 한 장으로, 같은 돈이라도 완전히 다른 안전함.
          </p>
        </div>
      </section>

      {/* Safety: 4-layer defense */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            허위 매물·사기 걱정되시죠?
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            피치마켓은 4겹의 방어선으로 사기 매물을 막습니다.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
            <SafetyStep
              n="1"
              icon="🆔"
              title="실명 인증"
              desc="PASS/NICE로 등록자 본인이 누구인지 먼저 확인합니다."
            />
            <SafetyStep
              n="2"
              icon="🏛️"
              title="등기부 대조"
              desc="등기부등본의 소유자 이름이 등록자와 일치하는지 자동 대조. ✓ 검증 뱃지가 붙어요."
            />
            <SafetyStep
              n="3"
              icon="🛡️"
              title="에스크로 보관"
              desc="보증금·월세는 피치마켓이 보관합니다. 입주 확인 전까지 집주인에게 전달되지 않아요."
            />
            <SafetyStep
              n="4"
              icon="📄"
              title="계약서·전자서명"
              desc="국토부 표준 계약서와 전자서명으로 분쟁 시 법적 근거를 남깁니다."
            />
          </div>
          <p className="text-center text-xs text-neutral-500 mt-6">
            설사 사기 매물이 올라와도, 보증금이 에스크로에 있기 때문에 실제 피해로 이어지지 않습니다.
          </p>
        </div>
      </section>

      {/* Local neighborhood */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            작은 동네, 신뢰할 수 있는 이웃
          </h2>
          <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
            피치마켓은 큰 플랫폼이 되려 하지 않아요. 같은 동네에 사는 사람들끼리
            방을 내놓고, 구하고, 조용히 계약하는 곳입니다.
            <br />
            <br />
            직거래 카페의 편안함과 정식 계약서의 안전함을, 한 곳에서 만나보세요.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            이렇게 진행돼요
          </h2>
          <p className="text-center text-neutral-500 text-sm mt-2">
            복잡한 단계 없이, 중요한 것만 자동으로
          </p>
          <ol className="mt-10 space-y-3">
            {[
              ["1", "지도에서 방 찾기", "원하는 동네에서 방을 둘러보세요"],
              ["2", "이 방 신청", "마음에 드는 방에 메시지와 함께 신청"],
              ["3", "집주인 수락", "집주인이 수락하면 계약이 시작돼요"],
              ["4", "등기부 자동 확인", "권리관계·사기 리스크를 먼저 확인"],
              ["5", "표준 계약서 자동 작성", "국토부 양식 그대로 자동 생성"],
              ["6", "전자서명 + 보증금 에스크로", "서명 후 보증금은 안전하게 보관"],
              ["7", "입주 완료", "끝. 중개수수료는 0원"],
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

      {/* CTA */}
      <section className="bg-pink-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">
            복비 없이, 조용히 방을 구하세요
          </h2>
          <p className="mt-3 text-pink-100 text-sm">
            가입도 검색도 계약도 모두 무료입니다.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link
              href="/map"
              className="bg-white text-pink-600 font-bold px-6 py-3 rounded-lg"
            >
              방 둘러보기
            </Link>
            <Link
              href="/signup"
              className="bg-pink-700 hover:bg-pink-800 text-white font-bold px-6 py-3 rounded-lg border border-pink-400"
            >
              회원가입
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-900 text-neutral-400 text-xs py-10">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="text-base font-bold text-white mb-1">🍑 피치마켓</div>
              <div>수수료 없는 월세 · 단기 · 전대</div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/map" className="hover:text-white">방 찾기</Link>
              <Link href="/listings/new" className="hover:text-white">방 올리기</Link>
              <Link href="/login" className="hover:text-white">로그인</Link>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-4 flex flex-col sm:flex-row justify-between gap-2">
            <div className="text-[11px] leading-relaxed">
              상호: 피치마켓 · 대표: (주)피치마켓 · 사업자등록번호: 000-00-00000
              <br />
              이메일: support@peach.market · 주소: 서울특별시 강남구 (가상)
            </div>
            <div className="flex gap-3">
              <Link href="/terms" className="hover:text-white">이용약관</Link>
              <Link href="/privacy" className="hover:text-white">개인정보처리방침</Link>
              <Link href="/refund" className="hover:text-white">환불 정책</Link>
            </div>
          </div>
          <div className="text-[10px] text-neutral-500">© 2026 피치마켓. 데모 서비스입니다.</div>
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

function SafetyStep({
  n,
  icon,
  title,
  desc,
}: {
  n: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-neutral-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-full bg-pink-600 text-white text-xs font-bold flex items-center justify-center">
          {n}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-bold text-sm">{title}</h3>
      <p className="text-xs text-neutral-600 mt-1">{desc}</p>
    </div>
  );
}

function DesireCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-bold mb-1 text-base">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
    </div>
  );
}

