"use client";

import { useState } from "react";

type Registry = {
  source: string;
  issuedAt: string;
  property: {
    address: string;
    buildingName?: string | null;
    lotNumber?: string;
    structure?: string;
    totalArea?: number;
    exclusiveArea?: number;
    registeredAt?: string;
  };
  owner: { name: string; idMasked: string; acquiredAt?: string; acquireReason?: string };
  encumbrances: {
    type: string;
    creditor: string;
    amount_man?: number;
    registeredAt?: string;
    status?: string;
  }[];
  transactions: {
    date: string;
    type: string;
    from: string;
    to: string;
    price_man?: number;
  }[];
  warnings: string[];
  riskScore?: number;
  summary: string;
};

export default function RegistryViewer({ listingId }: { listingId: string }) {
  const [data, setData] = useState<Registry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${listingId}/registry`);
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "조회 실패");
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm">📜 등기부등본 자동 조회</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              인터넷등기소에서 권리관계·근저당·가압류를 확인합니다.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded shrink-0 disabled:opacity-50"
          >
            {loading ? "조회 중..." : "조회"}
          </button>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  const risk = data.riskScore ?? 0;
  const riskColor =
    risk >= 70 ? "bg-red-100 text-red-700" :
    risk >= 40 ? "bg-yellow-100 text-yellow-700" :
    "bg-green-100 text-green-700";

  return (
    <div className="border rounded-lg bg-white p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">📜 등기부등본 (요약)</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded ${riskColor}`}>
          리스크 {risk}/100
        </span>
      </div>
      <p className="text-xs text-neutral-500">
        발급 {new Date(data.issuedAt).toLocaleString("ko-KR")} · source: {data.source}
      </p>

      <section>
        <h4 className="text-xs font-bold text-neutral-600 mb-1">🏠 표제부</h4>
        <div className="text-xs space-y-0.5 bg-neutral-50 p-2 rounded">
          <div>주소: {data.property.address}</div>
          {data.property.buildingName && <div>건물명: {data.property.buildingName}</div>}
          {data.property.lotNumber && <div>지번: {data.property.lotNumber}</div>}
          {data.property.structure && <div>구조: {data.property.structure}</div>}
          {data.property.exclusiveArea && (
            <div>전용면적: {data.property.exclusiveArea}㎡</div>
          )}
        </div>
      </section>

      <section>
        <h4 className="text-xs font-bold text-neutral-600 mb-1">👤 갑구 (소유권)</h4>
        <div className="text-xs space-y-0.5 bg-neutral-50 p-2 rounded">
          <div>소유자: {data.owner.name} ({data.owner.idMasked})</div>
          {data.owner.acquiredAt && (
            <div>취득일: {data.owner.acquiredAt} ({data.owner.acquireReason})</div>
          )}
        </div>
      </section>

      <section>
        <h4 className="text-xs font-bold text-neutral-600 mb-1">📋 을구 (담보·제한)</h4>
        {data.encumbrances.length === 0 ? (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✅ 등기된 담보 없음
          </div>
        ) : (
          <div className="space-y-1">
            {data.encumbrances.map((e, i) => (
              <div
                key={i}
                className={`text-xs p-2 rounded ${
                  e.status === "말소" ? "bg-neutral-100 text-neutral-500 line-through" : "bg-red-50"
                }`}
              >
                <strong>{e.type}</strong> · {e.creditor}
                {e.amount_man != null && ` · ${e.amount_man.toLocaleString()}만원`}
                {e.registeredAt && ` · ${e.registeredAt}`}
                {e.status && ` (${e.status})`}
              </div>
            ))}
          </div>
        )}
      </section>

      {data.transactions.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-neutral-600 mb-1">📜 거래 이력</h4>
          <div className="space-y-1">
            {data.transactions.map((t, i) => (
              <div key={i} className="text-xs bg-neutral-50 p-2 rounded">
                {t.date} · {t.type} · {t.from} → {t.to}
                {t.price_man != null && ` · ${t.price_man.toLocaleString()}만원`}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.warnings.length > 0 && (
        <section>
          <h4 className="text-xs font-bold text-neutral-600 mb-1">⚠️ 주의 사항</h4>
          <ul className="space-y-0.5">
            {data.warnings.map((w, i) => (
              <li key={i} className="text-xs text-red-700 bg-red-50 p-2 rounded">
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded text-xs">
        <strong className="text-blue-800">AI 요약: </strong>
        <span className="text-neutral-700">{data.summary}</span>
      </div>

      <p className="text-[10px] text-neutral-400 italic">
        ⚠️ 데모 환경의 시뮬레이션 데이터입니다. 실거래 시 인터넷등기소(IROS)에서 직접 발급받아주세요.
      </p>
    </div>
  );
}
