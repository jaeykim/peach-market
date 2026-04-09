"use client";

import { useState } from "react";

// 데모 에스크로 가상 계좌 (실제는 PG사·은행 API로 발급)
const ESCROW_ACCOUNT = {
  bank: "피치마켓 에스크로 (토스페이먼츠 가상계좌)",
  number: "9999-0123-456789",
  holder: "피치마켓 에스크로",
};

export default function EarnestMoneyCard({
  dealId,
  isBuyer,
  agreedPrice, // 만원
  initialAmount,
  initialStatus,
  initialPaidAt,
}: {
  dealId: string;
  isBuyer: boolean;
  isSeller: boolean;
  agreedPrice: number;
  initialAmount: number | null;
  initialStatus: string | null;
  initialPaidAt: string | null;
  initialConfirmedAt: string | null;
}) {
  // 기본값: 합의가의 1% (1000만원 미만이면 100만원)
  const defaultEarnest = Math.max(100, Math.round((agreedPrice * 1) / 100));
  const [amount, setAmount] = useState<string>(
    (initialAmount ?? defaultEarnest).toString(),
  );
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [paidAt, setPaidAt] = useState<string | null>(initialPaidAt);
  const [showPay, setShowPay] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/deals/${dealId}/earnest-money`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseInt(amount, 10) }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "송금 실패");
        return;
      }
      const j = await res.json();
      setStatus(j.deal.earnestMoneyStatus);
      setPaidAt(j.deal.earnestMoneyPaidAt);
      setShowPay(false);
    } finally {
      setPaying(false);
    }
  }

  return (
    <section className="border rounded-lg bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">🛡️ 가계약금 (피치마켓 에스크로)</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            가계약금은 피치마켓 에스크로에 안전하게 보관되며, 본 계약 완료 시 매도인에게 자동 송금됩니다.
          </p>
        </div>
        {status === "CONFIRMED" && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
            🔒 에스크로 보관 중
          </span>
        )}
      </div>

      {status === "CONFIRMED" ? (
        <div className="mt-3 bg-green-50 border-l-4 border-green-500 p-3 rounded text-sm">
          <div className="font-bold text-green-900">
            🔒 가계약금 {(initialAmount ?? parseInt(amount, 10)).toLocaleString()}만원 에스크로 보관 중
          </div>
          <div className="text-xs text-neutral-600 mt-0.5">
            보관 시작: {paidAt && new Date(paidAt).toLocaleString("ko-KR")}
          </div>
          <div className="text-xs text-green-800 mt-1 font-semibold">
            ✅ 본 계약 진행이 시작되었습니다.
            <br />
            거래 완료 시 매도인 계좌로 자동 송금되며, 결렬 시 매수인에게 환불됩니다.
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {!isBuyer ? (
            <p className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded">
              매수인이 가계약금을 에스크로에 입금하면 자동으로 알림을 받습니다. 매도인의 별도 확인이 필요하지 않습니다.
            </p>
          ) : !showPay ? (
            <button
              onClick={() => setShowPay(true)}
              className="bg-pink-600 text-white text-sm font-bold px-4 py-2 rounded"
            >
              🛡️ 가계약금 에스크로 입금
            </button>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-neutral-600 block mb-1">
                  입금 금액 (만원)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  추천: {defaultEarnest.toLocaleString()}만원 (합의가의 1%)
                </p>
              </div>

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
                  ✅ 입금 즉시 자동 확인되며, 매도인에게는 직접 송금되지 않고 본 계약 완료 시까지 피치마켓이 안전하게 보관합니다.
                  <br />
                  거래 결렬 시에는 환불 정책에 따라 매수인에게 반환됩니다.
                </p>
                <p className="text-[10px] text-neutral-400 italic mt-1">
                  ⚠️ 데모: 실제 송금은 발생하지 않습니다. (실서비스 시 토스페이먼츠 PG 가상계좌 발급)
                </p>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={pay}
                  disabled={paying || !amount}
                  className="bg-pink-600 text-white text-sm font-bold px-4 py-2 rounded disabled:opacity-50"
                >
                  {paying ? "입금 처리 중..." : "🛡️ 입금 완료 (자동 확인)"}
                </button>
                <button
                  onClick={() => setShowPay(false)}
                  className="bg-neutral-200 text-neutral-700 text-sm px-4 py-2 rounded"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
