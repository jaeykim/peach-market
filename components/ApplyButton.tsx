"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyButton({
  listingId,
  listingTitle,
  monthlyAmount,
  deposit,
  isShortTerm,
  rentalMonths,
  isOwner,
  isLoggedIn,
  isClosed,
  ownershipVerified,
}: {
  listingId: string;
  listingTitle: string;
  monthlyAmount: number;
  deposit: number | null;
  isShortTerm: boolean;
  rentalMonths: number | null;
  isOwner: boolean;
  isLoggedIn: boolean;
  isClosed: boolean;
  ownershipVerified: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${listingId}/apply`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "신청 실패");
        return;
      }
      const j = await res.json();
      router.push(`/deals/${j.deal.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (isClosed) {
    return (
      <div className="border rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600">
        이미 마감된 매물입니다.
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="border rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
        본인이 등록한 매물입니다. 임차인의 신청을 기다려주세요.
      </div>
    );
  }

  const full = isShortTerm && rentalMonths ? monthlyAmount * rentalMonths : null;

  return (
    <div className="border rounded-lg bg-white p-4 space-y-3">
      <h3 className="font-bold">🔑 이 방 신청</h3>

      <div className="bg-pink-50 border border-pink-200 rounded p-3 text-sm space-y-1">
        <div className="font-semibold text-pink-900">{listingTitle}</div>
        {full ? (
          <>
            <div className="flex justify-between">
              <span className="text-neutral-600">단기임대 {rentalMonths}개월 총액</span>
              <span className="font-bold">{full.toLocaleString()}만원</span>
            </div>
            {deposit != null && deposit > 0 && (
              <div className="flex justify-between text-xs text-neutral-500">
                <span>+ 보증금 (에스크로)</span>
                <span>{deposit.toLocaleString()}만원</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-neutral-600">월세</span>
              <span className="font-bold">{monthlyAmount.toLocaleString()}만원</span>
            </div>
            {deposit != null && deposit > 0 && (
              <div className="flex justify-between text-xs text-neutral-500">
                <span>보증금 (에스크로)</span>
                <span>{deposit.toLocaleString()}만원</span>
              </div>
            )}
          </>
        )}
      </div>

      {ownershipVerified ? (
        <div className="bg-green-50 border border-green-200 rounded p-2 text-[11px] text-green-800">
          🏛️ 등기부 소유자와 등록자 실명이 일치하는 <strong>검증된 매물</strong>입니다.
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-[11px] text-yellow-800">
          ⚠️ 소유권 미검증 매물입니다. 신청 전 집주인에게 등기부 확인을 요청하세요.
          보증금은 피치마켓 에스크로에 보관되므로 사기 확인 시 환불 가능합니다.
        </div>
      )}

      <ol className="text-xs text-neutral-600 space-y-1">
        <li>1. 신청 시 자동으로 계약서가 생성돼요</li>
        <li>2. 임차인(나)이 계약서 검토 → 서명 → 에스크로 결제</li>
        <li>3. 임대인이 계약서 검토 → 서명·승인 → 입주 확정</li>
      </ol>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {isLoggedIn ? (
        <button
          onClick={apply}
          disabled={submitting}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded disabled:opacity-50"
        >
          {submitting ? "신청 중..." : "🔑 이 방 신청하기"}
        </button>
      ) : (
        <a
          href="/login"
          className="block w-full text-center bg-pink-600 text-white font-bold py-3 rounded"
        >
          로그인하고 신청하기
        </a>
      )}
    </div>
  );
}
