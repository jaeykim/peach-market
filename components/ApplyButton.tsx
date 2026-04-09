"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import RentalCalendar from "./RentalCalendar";

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
  shortTermMinMonths,
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
  shortTermMinMonths: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rentalMode, setRentalMode] = useState<"MONTHLY" | "SHORT_TERM">("MONTHLY");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // 가계약금 기본값: 월세의 50% 또는 10만원 (최소)
  const defaultEarnest = useMemo(() => {
    return Math.max(10, Math.round(monthlyAmount * 0.5));
  }, [monthlyAmount]);
  const [earnestMoney, setEarnestMoney] = useState(String(defaultEarnest));

  const days =
    startDate && endDate
      ? Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
        ) + 1
      : 0;

  async function apply() {
    if (!startDate || !endDate) {
      setError("임대 기간(시작일·종료일)을 선택해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${listingId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          earnestMoney: parseInt(earnestMoney, 10) || 0,
          startDate,
          endDate,
          rentalMode,
        }),
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
        <li>1. 가계약금 입금하고 신청 접수</li>
        <li>2. 집주인 수락</li>
        <li>3. 등기부 자동 확인 · 계약서 자동 작성</li>
        <li>4. 양측 전자서명 + 보증금·잔금 에스크로 입금</li>
        <li>5. 정산 · 입주 완료</li>
      </ol>

      {!isLoggedIn ? (
        <a
          href="/login"
          className="block w-full text-center bg-pink-600 text-white font-bold py-3 rounded"
        >
          로그인하고 신청하기
        </a>
      ) : !showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded"
        >
          🔑 이 방 신청하기
        </button>
      ) : (
        <div className="space-y-3 border-t pt-3">
          {/* 계약 유형 선택 */}
          {isShortTerm ? (
            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                계약 유형
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRentalMode("MONTHLY");
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className={`p-2 rounded border-2 text-sm font-semibold text-left ${
                    rentalMode === "MONTHLY"
                      ? "border-pink-500 bg-pink-50"
                      : "border-neutral-200"
                  }`}
                >
                  🗓️ 월세
                  <div className="text-[10px] text-neutral-500 font-normal">1년 이상 · 매월 결제</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRentalMode("SHORT_TERM");
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className={`p-2 rounded border-2 text-sm font-semibold text-left ${
                    rentalMode === "SHORT_TERM"
                      ? "border-pink-500 bg-pink-50"
                      : "border-neutral-200"
                  }`}
                >
                  ⏳ 단기임대
                  <div className="text-[10px] text-neutral-500 font-normal">
                    {shortTermMinMonths}개월 이상 · 일시불
                  </div>
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1">
              📅 임대 기간 선택 (
              {rentalMode === "SHORT_TERM"
                ? `최소 ${shortTermMinMonths}개월`
                : "최소 1년"}
              )
            </label>
            <RentalCalendar
              listingId={listingId}
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
              }}
              minDays={
                rentalMode === "SHORT_TERM"
                  ? shortTermMinMonths * 30
                  : 365
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 block">
              가계약금 (만원)
            </label>
            <input
              type="number"
              value={earnestMoney}
              onChange={(e) => setEarnestMoney(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              min={0}
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              추천: {defaultEarnest.toLocaleString()}만원 (월세의 50%) · 거절 시 전액 환불
            </p>
          </div>

          {days > 0 && (
            <div className="bg-pink-50 border border-pink-200 rounded p-2 text-xs">
              <strong>{days}일</strong> 임대 · 가계약금{" "}
              <strong>{parseInt(earnestMoney, 10).toLocaleString()}만원</strong>{" "}
              에스크로 보관
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={apply}
              disabled={submitting || !earnestMoney || !startDate || !endDate}
              className="flex-1 bg-pink-600 text-white font-bold py-2.5 rounded text-sm disabled:opacity-50"
            >
              {submitting
                ? "신청 중..."
                : `🛡️ ${parseInt(earnestMoney, 10).toLocaleString()}만원 입금하고 신청`}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
