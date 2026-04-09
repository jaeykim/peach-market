// 매물 등록 유형 라벨
// dealType + side + isSublet 조합으로 적절한 한국어 라벨을 반환
export function sideLabel(
  dealType: string,
  side: string,
  isSublet: boolean = false,
): string {
  if (dealType === "SALE") {
    return side === "SELL" ? "매도" : "매수";
  }
  // 월세/전세
  if (isSublet) {
    return side === "SELL" ? "전대" : "전차";
  }
  return side === "SELL" ? "임대" : "임차";
}

// 가격 범위 한국어 표시
// askingPrice: 기준가 (만원), min/max: 선택적 범위 (만원)
export function priceRangeLabel(
  askingPrice: number,
  min: number | null,
  max: number | null,
): string {
  const f = (n: number) => {
    if (n >= 10_000) {
      const eok = Math.floor(n / 10_000);
      const rest = n % 10_000;
      return rest ? `${eok}억 ${rest.toLocaleString()}만원` : `${eok}억원`;
    }
    return `${n.toLocaleString()}만원`;
  };
  if (min != null && max != null) return `${f(min)} ~ ${f(max)}`;
  if (min != null && max == null) return `${f(min)} 이상`;
  if (min == null && max != null) return `${f(max)} 이하`;
  return f(askingPrice);
}

// 긴 형태 (매도 매물 / 매수 희망)
export function sideLongLabel(
  dealType: string,
  side: string,
  isSublet: boolean = false,
): string {
  if (dealType === "SALE") {
    return side === "SELL" ? "매도 매물" : "매수 희망";
  }
  if (isSublet) {
    return side === "SELL" ? "전대 매물" : "전차 희망";
  }
  return side === "SELL" ? "임대 매물" : "임차 희망";
}
