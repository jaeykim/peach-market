export const metadata = { title: "개인정보처리방침 - 피치마켓" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">개인정보처리방침</h1>
      <p className="text-xs text-neutral-500 mb-6">시행일: 2026년 4월 9일</p>

      <Section title="1. 수집하는 개인정보 항목">
        회사는 서비스 제공을 위해 다음 정보를 수집합니다:
        <ul className="list-disc pl-5 mt-2">
          <li>필수: 이메일, 비밀번호, 이름, 전화번호</li>
          <li>본인 인증: 주민등록번호 (실명·실거주 확인 목적)</li>
          <li>거래 정보: 가계약금·보증금·월세 결제 내역</li>
          <li>자동 수집: 접속 로그, IP, 쿠키, 단말 정보</li>
        </ul>
      </Section>

      <Section title="2. 수집 목적">
        <ul className="list-disc pl-5">
          <li>회원 식별 및 로그인</li>
          <li>매물 등록·검색·계약 체결 지원</li>
          <li>등기부 검증을 통한 사기 매물 방지</li>
          <li>분쟁 발생 시 사실관계 확인</li>
          <li>서비스 개선 및 통계</li>
        </ul>
      </Section>

      <Section title="3. 보유 및 이용 기간">
        회원 탈퇴 시 즉시 파기. 단, 거래 기록 및 관련 법령에 따라 5년간 보관할 수 있습니다.
      </Section>

      <Section title="4. 제3자 제공">
        회사는 원칙적으로 회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 거래
        상대방에게는 거래 진행에 필요한 최소한의 정보(이름, 연락처, 마스킹된 주민등록번호)가
        제공됩니다.
      </Section>

      <Section title="5. 개인정보 보호 조치">
        <ul className="list-disc pl-5">
          <li>비밀번호 단방향 암호화 (bcrypt)</li>
          <li>주민등록번호 등 민감정보 암호화 저장 (실서비스)</li>
          <li>접근 권한 통제</li>
          <li>접근 로그 기록</li>
        </ul>
      </Section>

      <Section title="6. 이용자 권리">
        본인의 개인정보 열람·정정·삭제·처리 정지를 요청할 수 있으며, /me/edit에서 직접 수정
        가능합니다.
      </Section>

      <Section title="7. 개인정보 보호책임자">
        문의: privacy@peach.market
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
