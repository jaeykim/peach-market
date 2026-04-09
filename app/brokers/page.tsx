import Link from "next/link";
import BrokerCommissionCalculator from "@/components/BrokerCommissionCalculator";

export const metadata = { title: "공인중개사 파트너 - 피치마켓" };

export default function BrokersPage() {
  return (
    <div className="bg-neutral-50">
      {/* Phase 2 배너 */}
      <div className="bg-yellow-100 border-b border-yellow-300 py-3 text-center text-xs font-semibold text-yellow-900">
        ⚠️ 현재 피치마켓은 Phase 1(대학가 월세 직거래) 단계입니다. 중개사 파트너십은 Phase 2에 오픈 예정입니다.
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="text-xs font-bold text-blue-600 mb-2">
            FOR LICENSED BROKERS · COMING IN PHASE 2
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            반복 업무는 기술이,
            <br />
            <span className="text-blue-600">전문성은 중개사님이</span>
          </h1>
          <p className="mt-5 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
            매물 정보 정리·시세 자료·등기부·계약서 초안 같은 사전 준비를 피치마켓이 도와드립니다.
            <br />
            중개사님은 검토와 상담, 고객 응대 같은 진짜 전문 영역에 더 집중하세요.
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link
              href="/signup?broker=1"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
            >
              파트너 신청
            </Link>
            <Link
              href="#how"
              className="bg-white border-2 border-blue-600 text-blue-600 font-bold px-6 py-3 rounded-lg"
            >
              어떻게 동작하나요?
            </Link>
          </div>
          <p className="text-xs text-neutral-400 mt-6">
            ※ 시연 페이지입니다. 실제 파트너 모집은 향후 진행됩니다.
          </p>
        </div>
      </section>

      {/* Pain → Solution */}
      <section className="py-16 bg-white" id="how">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            사전 준비 작업, 피치마켓이 도와드립니다
          </h2>
          <p className="text-center text-neutral-500 text-sm">
            중개사님이 검토하고 판단하실 자료를 미리 정리해드립니다. 최종 결정은 항상 중개사님 몫입니다.
          </p>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden bg-white">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="text-left p-3">사전 준비 항목</th>
                  <th className="text-center p-3">일반적으로 걸리는 시간</th>
                  <th className="text-center p-3 bg-blue-50">피치마켓이 도와주는 방식</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["매물 답사·사진", "1-2일", "매도자 직접 등록 + AI 검증"],
                  ["시세 조사", "3-4일", "AI 적정가 (3초)"],
                  ["등기부 발급·해석", "수기", "자동 조회 + 위험 점수"],
                  ["권리관계 검토", "30분/건", "자동 분석 + 경고"],
                  ["광고·매수자 모집", "비용·시간", "매칭 자동 + 트래픽 공유"],
                  ["가격 협상 중재", "수일", "비공개 비딩 시스템"],
                  ["계약서 작성", "1시간", "AI 초안 → 검토만"],
                  ["중개대상물 확인설명서", "수기", "자동 작성 → 서명만"],
                  ["거래신고", "관할청 방문", "자동 제출"],
                  ["잔금·등기 일정 조율", "전화·문자", "자동 캘린더"],
                  ["세금 안내", "수기 계산", "자동 계산기"],
                ].map(([t, manual, auto], i) => (
                  <tr key={i}>
                    <td className="p-3 font-semibold">{t}</td>
                    <td className="p-3 text-center text-neutral-500">{manual}</td>
                    <td className="p-3 text-center bg-blue-50/30 font-semibold text-blue-700">
                      {auto}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100 font-bold">
                  <td className="p-3">사전 준비 시간</td>
                  <td className="p-3 text-center text-neutral-500">수일 소요</td>
                  <td className="p-3 text-center text-blue-700">대폭 단축</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center">파트너 중개사 혜택</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            <Card
              icon="⏱️"
              title="시간을 더 효율적으로"
              desc="자료 정리·서류 초안 같은 사전 준비를 줄이고, 검토와 상담에 더 많은 시간을 쓸 수 있어요."
            />
            <Card
              icon="📈"
              title="자연스러운 고객 유입"
              desc="피치마켓 트래픽을 통해 매수자·매도자가 직접 찾아옵니다."
            />
            <Card
              icon="💰"
              title="합리적인 비용"
              desc="투명한 SaaS 구독 모델. 광고비 부담 없이 필요한 만큼만 사용하세요."
            />
            <Card
              icon="🛡️"
              title="검토를 더 정확하게"
              desc="AI가 등기부·시세·권리관계를 사전 분석해 검토 포인트를 알려드립니다."
            />
            <Card
              icon="📊"
              title="데이터 인사이트"
              desc="지역별 시세 트렌드와 거래 통계를 한 화면에서 빠르게 확인."
            />
            <Card
              icon="🎯"
              title="새로운 고객층 만남"
              desc="1인 가구, MZ, 외국인 등 디지털 친화 사용자에게 자연스럽게 노출됩니다."
            />
          </div>
        </div>
      </section>

      {/* Pricing / Calculator */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            수익 계산기
          </h2>
          <p className="text-center text-neutral-500 text-sm mb-8">
            피치마켓을 통해 받게 되는 수익을 시뮬레이션해보세요.
          </p>
          <BrokerCommissionCalculator />
        </div>
      </section>

      {/* Legal note */}
      <section className="py-12 bg-neutral-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white border rounded-lg p-5 text-xs text-neutral-700 space-y-2">
            <h3 className="font-bold text-sm mb-1">⚖️ 합법성 안내</h3>
            <p>
              피치마켓은 공인중개사법에 따라 <strong>중개행위는 등록된 공인중개사만 수행</strong>합니다.
              플랫폼은 매물 정보·자료 준비·문서 자동 작성 등 <strong>중개 업무 보조 도구</strong>를 제공할 뿐이며,
              계약 검토·서명·책임은 모두 파트너 중개사가 담당합니다.
            </p>
            <p>
              이 모델은 헌법재판소가 2022년에 합헌 결정한
              <strong> 로톡(LawTalk)의 부동산 버전</strong>으로,
              명의대여(이름만 빌려주기)와는 다른 합법적 구조입니다.
              파트너 중개사는 정상적인 중개 행위를 수행하고, 그에 대한 보수를 받습니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold">
            지금 베타 파트너로 참여하세요
          </h2>
          <p className="mt-3 text-blue-100 text-sm">
            첫 12개월 SaaS 구독료 면제. 사용량 기반 정산만.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Link
              href="/signup?broker=1"
              className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg"
            >
              파트너 신청
            </Link>
            <Link
              href="/"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-lg border border-blue-400"
            >
              피치마켓 살펴보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-xs text-neutral-600">{desc}</p>
    </div>
  );
}
