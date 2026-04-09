export const metadata = { title: "이용약관 - 피치마켓" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose prose-sm">
      <h1 className="text-2xl font-bold mb-6">이용약관</h1>

      <p className="text-xs text-neutral-500 mb-6">시행일: 2026년 4월 9일</p>

      <Section title="제1조 (목적)">
        본 약관은 피치마켓(이하 &ldquo;회사&rdquo;)이 제공하는 부동산 직거래 중개 서비스(이하
        &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 회원과 회사의 권리·의무 및 책임 사항을 규정함을
        목적으로 합니다.
      </Section>

      <Section title="제2조 (서비스 제공)">
        회사는 다음과 같은 서비스를 무료로 제공합니다:
        <ul className="list-disc pl-5 mt-2">
          <li>월세·전세·단기임대·전대 매물 등록 및 검색</li>
          <li>매물 정보 검증 (등기부 자동 조회)</li>
          <li>표준 임대차 계약서 자동 작성</li>
          <li>전자서명</li>
          <li>가계약금·보증금·월세 에스크로 보관</li>
        </ul>
      </Section>

      <Section title="제3조 (회사의 역할)">
        회사는 직접 부동산 중개행위를 하지 않으며, 회원 간의 직거래를 안전하게 지원하는 정보 플랫폼·
        도구 제공자의 지위를 가집니다. 회사는 공인중개사법상의 중개업자가 아닙니다.
      </Section>

      <Section title="제4조 (회원의 책임)">
        회원은 등록 매물에 대한 정확한 정보 제공의 책임을 부담하며, 허위 매물 등록 시 즉시 강제
        탈퇴 및 법적 조치의 대상이 될 수 있습니다.
      </Section>

      <Section title="제5조 (에스크로 정책)">
        가계약금·보증금·월세 등 회원이 입금한 금액은 거래가 정상적으로 진행되기 전까지 회사가
        지정한 에스크로 계좌에 보관됩니다. 거래 결렬 시 환불 정책에 따라 환불됩니다.
      </Section>

      <Section title="제6조 (책임의 제한)">
        회사는 회원 간 직거래에서 발생한 분쟁·손해에 대하여 직접적인 책임을 지지 않으며, 분쟁
        해결은 양 당사자 간의 협의 또는 사법 절차에 따릅니다. 단, 회사가 제공한 검증·계약서 등이
        분쟁 해결의 자료로 사용될 수 있습니다.
      </Section>

      <Section title="제7조 (서비스 변경 및 종료)">
        회사는 서비스의 일부 또는 전부를 변경할 수 있으며, 종료 시 사전 공지합니다.
      </Section>

      <p className="text-xs text-neutral-500 mt-8">
        ※ 본 약관은 데모 단계의 임시 약관으로, 정식 출시 시 법무 검토 후 갱신됩니다.
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
