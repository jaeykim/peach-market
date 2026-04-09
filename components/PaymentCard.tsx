"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  type: "MONTHLY_RENT" | "SHORT_TERM_FULL" | "DEPOSIT" | string;
  billingMonth: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  status: string;
  paidAt: string;
};

const CARD_BRANDS = ["현대카드", "신한카드", "삼성카드", "KB국민카드", "우리카드"];

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function nextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function PaymentCard({
  dealId,
  isBuyer,
  isSeller,
  dealType,
  isShortTerm,
  rentalMonths,
  monthlyAmount, // 만원
  depositAmount, // 만원
}: {
  dealId: string;
  isBuyer: boolean;
  isSeller: boolean;
  dealType: string;
  isShortTerm: boolean;
  rentalMonths: number | null;
  monthlyAmount: number;
  depositAmount: number | null;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // 단기임대면 전체 금액 일시불, 아니면 월세 매달
  const isShortTermRental = isShortTerm && rentalMonths;
  const fullAmount = isShortTermRental ? monthlyAmount * rentalMonths! : monthlyAmount;

  const [cardNumber, setCardNumber] = useState("4000123412345678");
  const [cardBrand, setCardBrand] = useState(CARD_BRANDS[0]);
  const [billingMonth, setBillingMonth] = useState(currentMonth());

  async function load() {
    const res = await fetch(`/api/deals/${dealId}/payments`);
    if (res.ok) {
      const j = await res.json();
      setPayments(j.payments);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  async function submit(type: "MONTHLY_RENT" | "SHORT_TERM_FULL") {
    setPaying(true);
    setError("");
    try {
      const body = {
        amount: type === "SHORT_TERM_FULL" ? fullAmount : monthlyAmount,
        type,
        billingMonth: type === "MONTHLY_RENT" ? billingMonth : undefined,
        cardLast4: cardNumber.slice(-4),
        cardBrand,
      };
      const res = await fetch(`/api/deals/${dealId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "결제 실패");
        return;
      }
      setShowPay(false);
      if (type === "MONTHLY_RENT") setBillingMonth(nextMonth());
      await load();
    } finally {
      setPaying(false);
    }
  }

  if (dealType === "SALE") return null;

  const monthlyPayments = payments.filter((p) => p.type === "MONTHLY_RENT");
  const isMonthPaid = monthlyPayments.some((p) => p.billingMonth === billingMonth);
  const shortTermPaid = payments.some((p) => p.type === "SHORT_TERM_FULL");

  return (
    <section className="border rounded-lg bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">💳 카드 결제</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isShortTermRental
              ? `단기임대 ${rentalMonths}개월 전체 금액을 한 번에 결제`
              : "매달 월세를 카드로 간편하게 결제"}
          </p>
        </div>
      </div>

      <div className="mt-3 bg-neutral-50 border rounded p-3 text-sm space-y-1">
        {isShortTermRental ? (
          <>
            <div className="flex justify-between">
              <span className="text-neutral-500">월세 {monthlyAmount.toLocaleString()}만원 × {rentalMonths}개월</span>
              <span className="font-semibold">{fullAmount.toLocaleString()}만원</span>
            </div>
            {depositAmount && (
              <div className="flex justify-between text-neutral-500">
                <span>+ 보증금 (에스크로)</span>
                <span>{depositAmount.toLocaleString()}만원</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-between">
            <span className="text-neutral-500">월 결제액</span>
            <span className="font-semibold">{monthlyAmount.toLocaleString()}만원</span>
          </div>
        )}
      </div>

      {/* 결제 내역 */}
      <div className="mt-4">
        <h3 className="text-xs font-bold text-neutral-600 mb-1">결제 내역</h3>
        {loading ? (
          <p className="text-xs text-neutral-500">불러오는 중...</p>
        ) : payments.length === 0 ? (
          <p className="text-xs text-neutral-500">아직 결제 내역이 없습니다.</p>
        ) : (
          <ul className="space-y-1">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-green-900">
                    {p.type === "MONTHLY_RENT"
                      ? `월세 ${p.billingMonth}`
                      : p.type === "SHORT_TERM_FULL"
                      ? "단기임대 전체"
                      : p.type}
                    {" "}· {p.amount.toLocaleString()}만원
                  </div>
                  <div className="text-neutral-500">
                    {p.cardBrand} ****{p.cardLast4} ·{" "}
                    {new Date(p.paidAt).toLocaleString("ko-KR")}
                  </div>
                </div>
                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  PAID
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 결제 버튼 (임차인만) */}
      {isBuyer && !showPay && (
        <div className="mt-4">
          {isShortTermRental ? (
            shortTermPaid ? (
              <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                ✓ 단기임대 전체 금액 결제 완료
              </p>
            ) : (
              <button
                onClick={() => setShowPay(true)}
                className="w-full bg-pink-600 text-white font-bold py-2.5 rounded text-sm"
              >
                💳 {fullAmount.toLocaleString()}만원 카드 결제
              </button>
            )
          ) : (
            <>
              {isMonthPaid ? (
                <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
                  ✓ {billingMonth} 월세 결제 완료
                </p>
              ) : (
                <button
                  onClick={() => setShowPay(true)}
                  className="w-full bg-pink-600 text-white font-bold py-2.5 rounded text-sm"
                >
                  💳 {billingMonth} 월세 카드 결제
                </button>
              )}
            </>
          )}
        </div>
      )}

      {isSeller && (
        <p className="mt-3 text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded">
          임차인이 카드 결제 시 자동으로 알림을 받고 입금됩니다.
        </p>
      )}

      {showPay && isBuyer && (
        <div className="mt-4 border-2 border-pink-300 rounded p-3 space-y-3 bg-pink-50/50">
          <h3 className="text-sm font-bold">카드 정보 입력</h3>

          {!isShortTermRental && (
            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                결제 월
              </label>
              <input
                type="month"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1">
              카드 번호
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
              className="border rounded px-3 py-2 text-sm w-full font-mono"
              placeholder="0000 0000 0000 0000"
              maxLength={16}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1">
              카드사
            </label>
            <select
              value={cardBrand}
              onChange={(e) => setCardBrand(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full bg-white"
            >
              {CARD_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border rounded p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">결제 금액</span>
              <span className="font-bold text-pink-600">
                {(isShortTermRental ? fullAmount : monthlyAmount).toLocaleString()}만원
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 italic mt-1">
              ⚠️ 데모 결제입니다. 실제 카드 승인은 발생하지 않습니다. (실서비스 시 토스페이먼츠·나이스페이먼츠 연동)
            </p>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() =>
                submit(isShortTermRental ? "SHORT_TERM_FULL" : "MONTHLY_RENT")
              }
              disabled={paying || !cardNumber || cardNumber.length < 8}
              className="flex-1 bg-pink-600 text-white font-bold py-2 rounded text-sm disabled:opacity-50"
            >
              {paying ? "결제 중..." : "💳 결제하기"}
            </button>
            <button
              onClick={() => setShowPay(false)}
              className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
