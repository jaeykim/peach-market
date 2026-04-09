"use client";

import { useEffect, useState, useRef } from "react";

// 한국 부동산 거래 표준 비율
const DEFAULT_DOWN_RATE = 10; // 계약금 10%
const DEFAULT_MID_RATE = 50;  // 중도금 50%
const DEFAULT_FINAL_RATE = 40; // 잔금 40%

export default function DealContractForm({
  dealId,
  agreedPrice, // 단위: 만원
  initial,
}: {
  dealId: string;
  agreedPrice: number;
  initial: {
    closingDate?: string;
    downPayment?: number;
    midPayment?: number;
    finalPayment?: number;
    downRate?: number;
    midRate?: number;
    finalRate?: number;
    specialTerms?: string;
  };
}) {
  // 비율 (사용자가 직접 변경 가능)
  const [downRate, setDownRate] = useState(initial.downRate ?? DEFAULT_DOWN_RATE);
  const [midRate, setMidRate] = useState(initial.midRate ?? DEFAULT_MID_RATE);
  const [finalRate, setFinalRate] = useState(initial.finalRate ?? DEFAULT_FINAL_RATE);

  // 자동 계산된 금액 (만원)
  const downPayment = Math.round((agreedPrice * downRate) / 100);
  const midPayment = Math.round((agreedPrice * midRate) / 100);
  const finalPayment = agreedPrice - downPayment - midPayment;
  const total = downPayment + midPayment + finalPayment;
  const ratesValid = downRate + midRate + finalRate === 100;

  // 잔금일 (yyyy/mm/dd 분리 입력)
  const initialDate = initial.closingDate || "";
  const [year, setYear] = useState(initialDate.slice(0, 4));
  const [month, setMonth] = useState(initialDate.slice(5, 7));
  const [day, setDay] = useState(initialDate.slice(8, 10));
  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);

  function onYearChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setYear(digits);
    if (digits.length === 4) monthRef.current?.focus();
  }
  function onMonthChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 2);
    setMonth(digits);
    if (digits.length === 2) dayRef.current?.focus();
  }
  function onDayChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 2);
    setDay(digits);
  }

  const closingDate =
    year.length === 4 && month && day
      ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      : "";

  const [specialTerms, setSpecialTerms] = useState(initial.specialTerms || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // 디바운스 자동 저장
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      void save();
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downRate, midRate, finalRate, year, month, day, specialTerms]);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractData: {
          closingDate: closingDate || undefined,
          downPayment,
          midPayment,
          finalPayment,
          downRate,
          midRate,
          finalRate,
          specialTerms: specialTerms || undefined,
        },
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      {/* 잔금일: 4자리 → 2자리 → 2자리 자동 커서 이동 */}
      <Field label="잔금일">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            placeholder="2026"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            className="input w-20 text-center"
            maxLength={4}
          />
          <span className="text-neutral-400">년</span>
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            placeholder="06"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="input w-14 text-center"
            maxLength={2}
          />
          <span className="text-neutral-400">월</span>
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            placeholder="15"
            value={day}
            onChange={(e) => onDayChange(e.target.value)}
            className="input w-14 text-center"
            maxLength={2}
          />
          <span className="text-neutral-400">일</span>
        </div>
      </Field>

      {/* 비율 입력 */}
      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1">
          지급 비율 (%) — 합계 100%
        </label>
        <div className="grid grid-cols-3 gap-2">
          <RateInput label="계약금" value={downRate} onChange={setDownRate} />
          <RateInput label="중도금" value={midRate} onChange={setMidRate} />
          <RateInput label="잔금" value={finalRate} onChange={setFinalRate} />
        </div>
        {!ratesValid && (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ 비율 합계가 {downRate + midRate + finalRate}% 입니다. 100%가 되어야 합니다.
          </p>
        )}
      </div>

      {/* 자동 계산된 금액 표시 */}
      <div className="bg-neutral-50 border rounded-lg p-3">
        <div className="text-xs text-neutral-500 mb-2">
          합의 가격 <strong className="text-pink-600">{agreedPrice.toLocaleString()}만원</strong>{" "}
          기준 자동 계산
        </div>
        <PaymentRow label={`계약금 (${downRate}%)`} amount={downPayment} />
        <PaymentRow label={`중도금 (${midRate}%)`} amount={midPayment} />
        <PaymentRow label={`잔금 (${finalRate}%)`} amount={finalPayment} bold />
        <div className="border-t mt-2 pt-2 flex justify-between text-xs">
          <span className="text-neutral-500">합계</span>
          <span className="font-semibold">{total.toLocaleString()}만원</span>
        </div>
      </div>

      <Field label="특약 사항">
        <textarea
          className="input min-h-[80px]"
          value={specialTerms}
          onChange={(e) => setSpecialTerms(e.target.value)}
          placeholder="예) 잔금일 7일 전 매도인이 모든 임차인 명도 완료. 보일러 누수 매도인 부담."
        />
      </Field>

      <p className="text-xs text-neutral-500">
        {saving
          ? "저장 중..."
          : saved
          ? "✓ 자동 저장되었습니다."
          : "변경 사항은 자동으로 저장됩니다."}
      </p>

      <style jsx>{`
        :global(.input) {
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          padding: 8px 12px;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function RateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-[10px] text-neutral-500 block mb-0.5">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
          className="input flex-1"
          min={0}
          max={100}
        />
        <span className="text-xs text-neutral-400">%</span>
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  amount,
  bold,
}: {
  label: string;
  amount: number;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between text-sm py-0.5 ${bold ? "font-bold" : ""}`}>
      <span className="text-neutral-600">{label}</span>
      <span>{amount.toLocaleString()}만원</span>
    </div>
  );
}
