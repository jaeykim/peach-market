"use client";

import { useState, useMemo } from "react";

// 단순화된 한국 부동산 세금 계산기 (2026년 기준 가정, 실제와 차이 있을 수 있음)
// 단위: 만원
function calcAcquisitionTax(priceMan: number, type: "FIRST" | "MULTI"): number {
  // 매매가 6억 이하: 1.0% / 6~9억: 1.0~3.0% (선형) / 9억 초과: 3.0%
  // 다주택자: +8% (2주택), +12% (3주택+) — 단순화해 MULTI = 8.0%
  const priceWon = priceMan * 10_000;
  let rate = 0.01;
  if (priceWon > 900_000_000) rate = 0.03;
  else if (priceWon > 600_000_000) {
    rate = 0.01 + ((priceWon - 600_000_000) / 300_000_000) * 0.02;
  }
  if (type === "MULTI") rate = Math.max(rate, 0.08);
  return Math.round(priceMan * rate);
}

function calcCapitalGainsTax(buyMan: number, sellMan: number, holdYears: number): number {
  // 매우 단순화: 양도차익 - 기본공제 250만 → 누진세율
  // 실제는 장기보유특별공제, 1세대1주택 비과세, 등 복잡함
  const gain = sellMan - buyMan - 250;
  if (gain <= 0) return 0;
  // 보유 기간 할인 (2년 이상 보유 시)
  const ldd = holdYears >= 2 ? 0.85 : 1.0;
  // 누진세율 (단순)
  let tax = 0;
  let g = gain * ldd;
  const brackets: [number, number][] = [
    [1_400, 0.06],
    [5_000, 0.15],
    [8_800, 0.24],
    [15_000, 0.35],
    [30_000, 0.38],
    [50_000, 0.40],
    [100_000, 0.42],
    [Infinity, 0.45],
  ];
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (g <= 0) break;
    const slice = Math.min(g, cap - prev);
    tax += slice * rate;
    g -= slice;
    prev = cap;
  }
  return Math.round(tax);
}

export default function TaxCalculator() {
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [holdYears, setHoldYears] = useState("3");
  const [houses, setHouses] = useState<"FIRST" | "MULTI">("FIRST");

  const buy = parseInt(buyPrice, 10) || 0;
  const sell = parseInt(sellPrice, 10) || 0;
  const years = parseFloat(holdYears) || 0;

  const acquisition = useMemo(() => (buy > 0 ? calcAcquisitionTax(buy, houses) : 0), [buy, houses]);
  const capitalGains = useMemo(
    () => (buy > 0 && sell > 0 ? calcCapitalGainsTax(buy, sell, years) : 0),
    [buy, sell, years],
  );
  // 중개수수료(시중) 0.5%, 피치마켓 0%
  const conventionalCommission = sell ? Math.round(sell * 0.005) : 0;
  const peachCommission = 0;

  return (
    <div className="border rounded-lg bg-white p-4">
      <p className="text-xs text-neutral-500 mb-3">
        단순화된 시뮬레이션입니다. 실제는 1세대1주택 비과세, 장기보유특별공제, 지역별 세율 등 복잡한 조건이 적용됩니다.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Field label="매수 가격 (만원)">
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="예) 100000"
            className="input"
          />
        </Field>
        <Field label="매도 가격 (만원, 양도세용)">
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="예) 130000"
            className="input"
          />
        </Field>
        <Field label="보유 기간 (년)">
          <input
            type="number"
            value={holdYears}
            onChange={(e) => setHoldYears(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="주택 보유 상황">
          <select
            value={houses}
            onChange={(e) => setHouses(e.target.value as "FIRST" | "MULTI")}
            className="input"
          >
            <option value="FIRST">1주택 (생애최초/일반)</option>
            <option value="MULTI">다주택자</option>
          </select>
        </Field>
      </div>

      {buy > 0 && (
        <div className="mt-4 space-y-2 text-sm">
          <Row label="취득세 (매수 시)" value={`${acquisition.toLocaleString()}만원`} />
          {sell > 0 && (
            <Row label="양도소득세 (매도 시)" value={`${capitalGains.toLocaleString()}만원`} />
          )}
          {sell > 0 && (
            <>
              <Row
                label="시중 중개수수료 (0.5%)"
                value={`${conventionalCommission.toLocaleString()}만원`}
                muted
              />
              <Row
                label="🍑 피치마켓 수수료"
                value={`${peachCommission.toLocaleString()}만원`}
                highlight
              />
              <Row
                label="💰 절약 금액"
                value={`+${conventionalCommission.toLocaleString()}만원`}
                highlight
              />
            </>
          )}
        </div>
      )}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          padding: 8px 12px;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-neutral-600 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  highlight,
}: {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between border-b py-1.5 ${
        highlight ? "text-pink-600 font-bold" : muted ? "text-neutral-400" : ""
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
