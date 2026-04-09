"use client";

import { useState, useMemo } from "react";

export default function BrokerCommissionCalculator() {
  const [dealsPerMonth, setDealsPerMonth] = useState("8");
  const [avgPrice, setAvgPrice] = useState("80000"); // 만원
  const [feeRate, setFeeRate] = useState("0.4"); // %
  const [platformShare, setPlatformShare] = useState("15"); // %
  const [saasFee, setSaasFee] = useState("30"); // 만원/월

  const r = useMemo(() => {
    const deals = parseFloat(dealsPerMonth) || 0;
    const price = parseFloat(avgPrice) || 0;
    const fee = parseFloat(feeRate) / 100;
    const share = parseFloat(platformShare) / 100;
    const saas = parseFloat(saasFee) || 0;

    const grossPerDeal = price * fee; // 만원
    const grossMonthly = grossPerDeal * deals;
    const platformMonthly = grossMonthly * share + saas;
    const brokerMonthly = grossMonthly - grossMonthly * share - saas;
    const yearly = brokerMonthly * 12;

    // 시중 비교: 0.5% 수수료, 광고비 월 200, 거래량 동일
    const conventionalGross = price * 0.005 * deals;
    const conventionalNet = conventionalGross - 200;

    return {
      grossPerDeal,
      grossMonthly,
      platformMonthly,
      brokerMonthly,
      yearly,
      conventionalGross,
      conventionalNet,
      diff: brokerMonthly - conventionalNet,
    };
  }, [dealsPerMonth, avgPrice, feeRate, platformShare, saasFee]);

  return (
    <div className="border rounded-lg bg-white p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Field label="월 거래 건수">
          <input
            type="number"
            value={dealsPerMonth}
            onChange={(e) => setDealsPerMonth(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="평균 거래가 (만원)">
          <input
            type="number"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            className="input"
          />
          <p className="text-[10px] text-neutral-500 mt-0.5">
            예: 80000 = 8억
          </p>
        </Field>
        <Field label="중개수수료율 (%)">
          <input
            type="number"
            step="0.1"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="input"
          />
          <p className="text-[10px] text-neutral-500 mt-0.5">
            시중 0.4~0.5% 수준
          </p>
        </Field>
        <Field label="플랫폼 분배율 (%)">
          <input
            type="number"
            value={platformShare}
            onChange={(e) => setPlatformShare(e.target.value)}
            className="input"
          />
          <p className="text-[10px] text-neutral-500 mt-0.5">
            성공보수로 플랫폼이 가져가는 비율
          </p>
        </Field>
        <Field label="SaaS 구독료 (만원/월)">
          <input
            type="number"
            value={saasFee}
            onChange={(e) => setSaasFee(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <Row label="거래 1건당 총 수수료" value={`${r.grossPerDeal.toLocaleString()}만원`} />
        <Row label="월 총 수수료" value={`${r.grossMonthly.toLocaleString()}만원`} />
        <Row
          label={`└ 플랫폼 분배 (${platformShare}% + SaaS ${saasFee}만원)`}
          value={`-${r.platformMonthly.toLocaleString()}만원`}
          muted
        />
        <Row
          label="🍑 중개사 월 순수익"
          value={`${r.brokerMonthly.toLocaleString()}만원`}
          highlight
        />
        <Row
          label="🍑 중개사 연 순수익"
          value={`${r.yearly.toLocaleString()}만원`}
          highlight
        />

        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-semibold text-neutral-500 mb-2">
            ⚖️ 시중 모델과 비교 (수수료 0.5% / 광고비 월 200만원 가정)
          </p>
          <Row
            label="시중 월 수수료"
            value={`${r.conventionalGross.toLocaleString()}만원`}
          />
          <Row
            label="시중 월 순수익 (광고비 차감)"
            value={`${r.conventionalNet.toLocaleString()}만원`}
          />
          <Row
            label={r.diff >= 0 ? "✨ 피치마켓 추가 이익" : "⚠️ 차이"}
            value={`${r.diff >= 0 ? "+" : ""}${r.diff.toLocaleString()}만원/월`}
            highlight={r.diff >= 0}
          />
        </div>
      </div>

      <p className="text-[10px] text-neutral-400 italic">
        ⚠️ 단순 시뮬레이션입니다. 실제 거래 건수·수수료율은 시장 상황·지역·매물 종류에 따라 다릅니다.
      </p>

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
