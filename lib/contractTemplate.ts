// 한국 부동산 표준 계약서 템플릿
// 국토교통부 표준 양식에 더 가깝게 — 표 대신 정의 라인(라벨 : 값) 위주

type DealForContract = {
  listing: {
    address: string;
    addressDetail: string | null;
    propertyType: string;
    areaExclusive: number | null;
    areaSupply: number | null;
    floor: number | null;
    totalFloors: number | null;
    builtYear: number | null;
    dealType: string;
  };
  buyer: { name: string; email: string; phone: string | null; residentNumber: string | null; address: string | null };
  seller: { name: string; email: string; phone: string | null; residentNumber: string | null; address: string | null };
  agreedPrice: number; // 만원
  contractData: {
    closingDate?: string;
    downPayment?: number;
    midPayment?: number;
    finalPayment?: number;
    specialTerms?: string;
    sellerSignature?: string;
    buyerSignature?: string;
    sellerSignedAt?: string;
    buyerSignedAt?: string;
  };
};

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

// 만원 단위 → "金 X억Y만원정 (₩...)"
function han(n: number | undefined): string {
  if (n == null || n === 0) return "金                                   원정";
  if (n >= 10_000) {
    const eok = Math.floor(n / 10_000);
    const rest = n % 10_000;
    if (rest === 0) return `金 ${eok}억원정 (₩${(n * 10_000).toLocaleString()})`;
    return `金 ${eok}억 ${rest.toLocaleString()}만원정 (₩${(n * 10_000).toLocaleString()})`;
  }
  return `金 ${n.toLocaleString()}만원정 (₩${(n * 10_000).toLocaleString()})`;
}

function formatDate(d: string | undefined): string {
  if (!d) return "        년      월      일";
  const [y, m, day] = d.split("-");
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(day, 10)}일`;
}

// 주민등록번호 마스킹: 850315-1****** (앞 7자리만 노출)
function maskRRN(rrn: string | null): string {
  if (!rrn) return "(미입력)";
  const clean = rrn.replace(/\s/g, "");
  if (clean.length < 8) return clean;
  return clean.slice(0, 8) + "******";
}

function todayKr(): string {
  const t = new Date();
  return `${t.getFullYear()}년 ${t.getMonth() + 1}월 ${t.getDate()}일`;
}

export function buildContract(deal: DealForContract): string {
  const { listing, buyer, seller, agreedPrice, contractData } = deal;
  const isLease = listing.dealType !== "SALE";
  const docTitle = isLease
    ? listing.dealType === "JEONSE"
      ? "부동산 전세 계약서"
      : "부동산 월세 계약서"
    : "부동산 매매 계약서";
  const partyA = isLease ? "임대인" : "매도인";
  const partyB = isLease ? "임차인" : "매수인";
  const priceLabel = isLease
    ? listing.dealType === "JEONSE"
      ? "전세보증금"
      : "월세금"
    : "매매대금";

  const fullAddress = `${listing.address}${listing.addressDetail ? " " + listing.addressDetail : ""}`;

  const sellerSig = contractData.sellerSignature ? `{{SIG:SELLER}}` : `(인)`;
  const buyerSig = contractData.buyerSignature ? `{{SIG:BUYER}}` : `(인)`;

  const areaLine = listing.areaExclusive
    ? `${listing.areaExclusive}㎡  ( ${(listing.areaExclusive / 3.3058).toFixed(2)}평 )`
    : "             ㎡";
  const supplyLine = listing.areaSupply ? `${listing.areaSupply}㎡` : "             ㎡";
  const floorLine = listing.floor ? `${listing.floor}층 / 총 ${listing.totalFloors ?? "?"}층` : "          ";
  const yearLine = listing.builtYear ? `${listing.builtYear}년` : "          ";

  return `# ${docTitle}

${partyA}과 ${partyB} 쌍방은 아래 표시 부동산에 관하여 다음 계약 내용과 같이 ${
    isLease ? "임대차" : "매매"
  } 계약을 체결한다.

## 1. 부동산의 표시

| 소 재 지 | ${fullAddress} |
| 토    지 | 지목 / 면적 (등기부 기재) |
| 건    물 | ${PROP_LABEL[listing.propertyType] || listing.propertyType} · 구조 (등기부 기재) |
| 전용면적 | ${areaLine} |
| 공급면적 | ${supplyLine} |
| 층    수 | ${floorLine} |
| 준 공 년 | ${yearLine} |

## 2. 계약 내용

### 제1조 (목적)
위 부동산의 ${
    isLease ? "임대차" : "매매"
  }에 있어 ${partyA}과 ${partyB}은 합의에 의하여 ${priceLabel}을 아래와 같이 지불하기로 한다.

### 제2조 (${priceLabel}의 지급)

| ${priceLabel} | ${han(agreedPrice)} |  |
| 계 약 금 | ${han(contractData.downPayment)} | 본 계약 체결과 동시에 지급 |
| 중 도 금 | ${han(contractData.midPayment)} | 별도 합의일에 지급 |
| 잔    금 | ${han(contractData.finalPayment)} | ${formatDate(contractData.closingDate)}에 지급 |

### 제3조 (소유권 이전 등${isLease ? " 인도" : ""})
${
  isLease
    ? `${partyA}은 위 부동산을 임대차 목적대로 사용·수익할 수 있는 상태로 ${formatDate(
        contractData.closingDate,
      )}까지 ${partyB}에게 인도하며, 임대차 기간은 인도일로부터 [기간]으로 한다.`
    : `${partyA}은 ${priceLabel}의 잔금 수령과 동시에 ${partyB}에게 소유권 이전등기에 필요한 모든 서류를 교부하고 등기절차에 협력하여야 하며, 위 부동산의 인도일은 ${formatDate(
        contractData.closingDate,
      )}로 한다.`
}

### 제4조 (제한물권 등의 소멸)
${partyA}은 위 부동산에 설정된 저당권, 지상권, 임차권 등 소유권의 행사를 제한하는 사유가 있거나 제세공과 기타 부담금의 미납이 있을 때에는 잔금 수수일까지 그 권리의 하자 및 부담 등을 제거하여 완전한 ${
    isLease ? "사용·수익권" : "소유권"
  }을 ${partyB}에게 ${isLease ? "보장" : "이전"}한다. 다만 승계하기로 합의한 권리는 그러하지 아니하다.

### 제5조 (지방세 등의 부담)
위 부동산에 관하여 발생한 수익의 귀속과 제세공과금 등의 부담은 위 부동산의 인도일을 기준으로 하되, 지방세의 납부의무 및 납부책임은 지방세법의 규정에 의한다.

### 제6조 (계약의 해제)
${partyB}이 ${partyA}에게 중도금(중도금이 없을 때에는 잔금)을 지불하기 전까지 ${partyA}은 계약금의 배액을 상환하고, ${partyB}은 계약금을 포기하고 본 계약을 해제할 수 있다.

### 제7조 (채무불이행과 손해배상)
${partyA} 또는 ${partyB}이 본 계약상의 내용에 대하여 불이행이 있을 경우 그 상대방은 불이행한 자에 대하여 서면으로 이행을 최고하고 계약을 해제할 수 있다. 그리고 계약 당사자는 계약해제에 따른 손해배상을 각각 상대방에게 청구할 수 있으며, 손해배상에 대하여 별도의 약정이 없는 한 계약금을 손해배상의 기준으로 본다.

### 제8조 (중개보수)
부동산 중개업자는 ${partyA}과 ${partyB}이 본 계약을 불이행함으로 인한 책임을 지지 않는다. 또한, 중개보수는 본 계약의 체결과 동시에 계약 당사자 쌍방이 각각 지불하며, 중개업자의 고의나 과실 없이 본 계약이 무효·취소 또는 해제되어도 중개보수는 지급한다.

### 제9조 (중개대상물 확인·설명서 교부 등)
중개업자는 중개대상물 확인·설명서를 작성하고 업무보증관계증서(공제증서 등) 사본을 첨부하여 ${formatDate(
    contractData.closingDate,
  )} 거래 당사자 쌍방에게 교부한다.

## 3. 특약사항

${
  contractData.specialTerms
    ? contractData.specialTerms
        .split("\n")
        .filter((s) => s.trim())
        .map((s, i) => `${i + 1}. ${s.replace(/^\d+\.\s*/, "")}`)
        .join("\n")
    : "1. \n2. \n3. "
}

---

본 계약을 증명하기 위하여 계약 당사자가 이의 없음을 확인하고 각자 서명·날인한 후 ${partyA}, ${partyB}이 각 1통씩 보관한다.

::right
${todayKr()}
:::

:::parties
@@${partyA}
주     소 : ${seller.address || "(주민등록상 주소 미입력)"}
주민등록번호 : ${maskRRN(seller.residentNumber)}
전     화 : ${seller.phone || "                "}
성     명 : ${seller.name}    ${sellerSig}
@@${partyB}
주     소 : ${buyer.address || "(주민등록상 주소 미입력)"}
주민등록번호 : ${maskRRN(buyer.residentNumber)}
전     화 : ${buyer.phone || "                "}
성     명 : ${buyer.name}    ${buyerSig}
:::

*본 계약서는 피치마켓 표준 양식 자동 생성 시스템으로 작성된 초안입니다. 법적 효력을 위해서는 양 당사자의 전자서명 또는 자필서명이 필요합니다.*
`;
}
