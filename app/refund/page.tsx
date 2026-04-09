export const metadata = { title: "환불 정책 - 피치마켓" };

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">환불 정책</h1>
      <p className="text-xs text-neutral-500 mb-6">시행일: 2026년 4월 9일</p>

      <Section title="1. 가계약금">
        <ul className="list-disc pl-5">
          <li><strong>집주인 거절 시</strong>: 즉시 전액 환불 (1영업일 이내 입금)</li>
          <li><strong>임차인 단순 변심</strong>: 가계약금 포기 (반환되지 않음)</li>
          <li><strong>집주인 단순 변심 / 허위 매물</strong>: 가계약금의 2배 환급 + 입증된 손해 배상</li>
        </ul>
      </Section>

      <Section title="2. 보증금">
        보증금은 거래 완료(입주 확정) 시까지 피치마켓 에스크로에 보관되며, 이후 임대인에게
        송금됩니다. 임대차 기간 종료 시에는 임대인이 임차인에게 보증금을 직접 반환합니다.
      </Section>

      <Section title="3. 월세">
        매월 결제된 월세는 결제일로부터 7일 이내에 임대인에게 송금됩니다. 7일 이내에는
        취소·환불 요청이 가능합니다.
      </Section>

      <Section title="4. 단기임대 전체 결제">
        단기임대 기간 전체 금액을 일시불로 결제한 경우, 입주 시작일로부터 7일 이내에는 일부 환불
        가능합니다. 입주일로부터 7일 이후에는 임대 기간에 비례한 환불만 가능합니다.
      </Section>

      <Section title="5. 분쟁 발생 시">
        회사는 분쟁 조정을 위해 다음 자료를 활용합니다:
        <ul className="list-disc pl-5 mt-2">
          <li>전자서명된 표준 임대차 계약서</li>
          <li>등기부 검증 기록</li>
          <li>채팅 기록</li>
          <li>결제·송금 내역</li>
        </ul>
        조정에도 합의되지 않을 경우 소비자분쟁조정위원회 또는 사법 절차에 따릅니다.
      </Section>

      <Section title="6. 환불 신청 방법">
        피치마켓 고객센터(support@peach.market) 또는 거래 상세 페이지의 분쟁 신고 기능을 통해
        요청하실 수 있습니다.
      </Section>

      <p className="text-xs text-neutral-500 mt-8">
        ※ 본 정책은 데모 단계의 임시 정책입니다.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="font-bold text-base mb-2">{title}</h2>
      <div className="text-sm text-neutral-700 leading-relaxed">{children}</div>
    </section>
  );
}
