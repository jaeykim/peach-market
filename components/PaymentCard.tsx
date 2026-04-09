"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  type: "MONTHLY_RENT" | "SHORT_TERM_FULL" | "DEPOSIT" | string;
  billingMonth: string | null;
  method: string;
  cardLast4: string | null;
  cardBrand: string | null;
  status: string;
  paidAt: string;
};

const CARD_BRANDS = ["현대카드", "신한카드", "삼성카드", "KB국민카드", "우리카드"];

// 피치마켓 에스크로 가상 계좌 (데모)
const ESCROW_ACCOUNT = {
  bank: "피치마켓 에스크로 (토스페이먼츠 가상계좌)",
  number: "9999-0123-456789",
  holder: "피치마켓 에스크로",
};

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

  const [method, setMethod] = useState<"TRANSFER" | "CARD">("TRANSFER");
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
        method,
        billingMonth: type === "MONTHLY_RENT" ? billingMonth : undefined,
        cardLast4: method === "CARD" ? cardNumber.slice(-4) : undefined,
        cardBrand: method === "CARD" ? cardBrand : undefined,
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
          <h2 className="font-bold">🛡️ 결제 (피치마켓 에스크로)</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isShortTermRental
              ? `단기임대 ${rentalMonths}개월 전체 금액을 한 번에`
              : "매달 월세 결제"}
            {" "}· 피치마켓이 안전하게 보관한 뒤 임대인에게 입금합니다.
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
                    {p.method === "CARD"
                      ? `💳 ${p.cardBrand} ****${p.cardLast4}`
                      : "🛡️ 에스크로 이체"}
                    {" · "}
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
                🛡️ {fullAmount.toLocaleString()}만원 결제하기
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
                  🛡️ {billingMonth} 월세 결제하기
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
          <h3 className="text-sm font-bold">결제 수단 선택</h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMethod("TRANSFER")}
              className={`p-3 rounded border-2 text-left transition ${
                method === "TRANSFER"
                  ? "border-pink-500 bg-white"
                  : "border-neutral-200 bg-white/50"
              }`}
            >
              <div className="text-sm font-bold">🛡️ 에스크로 이체</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                가상계좌로 송금 · 추천
              </div>
            </button>
            <button
              onClick={() => setMethod("CARD")}
              className={`p-3 rounded border-2 text-left transition ${
                method === "CARD"
                  ? "border-pink-500 bg-white"
                  : "border-neutral-200 bg-white/50"
              }`}
            >
              <div className="text-sm font-bold">💳 카드 결제</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                신용·체크카드 즉시 결제
              </div>
            </button>
          </div>

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

          {method === "TRANSFER" ? (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1">
              <div className="font-bold text-blue-900">🛡️ 에스크로 가상 계좌</div>
              <div>
                은행: <strong>{ESCROW_ACCOUNT.bank}</strong>
              </div>
              <div>
                계좌번호: <strong>{ESCROW_ACCOUNT.number}</strong>
              </div>
              <div>
                예금주: <strong>{ESCROW_ACCOUNT.holder}</strong>
              </div>
              <p className="text-[11px] text-blue-700 mt-2">
                ✅ 입금이 확인되면 피치마켓이 안전하게 보관한 뒤,
                {isShortTermRental
                  ? " 계약 완료 시 임대인에게 일괄 송금합니다."
                  : " 매월 임대인에게 자동 송금합니다."}
              </p>
              <p className="text-[10px] text-neutral-400 italic mt-1">
                ⚠️ 데모: 실제 송금은 발생하지 않습니다. (실서비스 시 토스페이먼츠 PG 가상계좌 발급)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  카드 번호
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                  }
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
              <p className="text-[10px] text-neutral-400 italic">
                ⚠️ 데모 결제입니다. 실제 카드 승인은 발생하지 않습니다.
              </p>
            </div>
          )}

          <div className="bg-white border rounded p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">결제 금액</span>
              <span className="font-bold text-pink-600">
                {(isShortTermRental ? fullAmount : monthlyAmount).toLocaleString()}만원
              </span>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() =>
                submit(isShortTermRental ? "SHORT_TERM_FULL" : "MONTHLY_RENT")
              }
              disabled={paying || (method === "CARD" && (!cardNumber || cardNumber.length < 8))}
              className="flex-1 bg-pink-600 text-white font-bold py-2 rounded text-sm disabled:opacity-50"
            >
              {paying
                ? "처리 중..."
                : method === "TRANSFER"
                ? "🛡️ 입금 완료 표시"
                : "💳 카드 결제"}
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
