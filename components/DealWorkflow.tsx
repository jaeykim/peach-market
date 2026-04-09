"use client";

import { useEffect, useState } from "react";
import SignaturePad from "./SignaturePad";
import ContractDocument from "./ContractDocument";

type Step = {
  key: string;
  label: string;
  desc: string;
  status: "DONE" | "READY" | "PENDING" | "BLOCKED";
  action?: string;
};

// Phase 1: 중개사 플로우 비활성. Phase 2에서 true로 변경.
const SHOW_BROKER: boolean = false;

type BrokerInfo = {
  id: string;
  name: string;
  brokerLicense: string | null;
  brokerOffice: string | null;
  brokerRegion: string | null;
} | null;

export default function DealWorkflow({
  dealId,
  initialContract,
  initialBroker,
  isBuyer,
  isSeller,
  initialBuyerSignature,
  initialSellerSignature,
}: {
  dealId: string;
  initialContract: string | null;
  initialBroker: BrokerInfo;
  isBuyer: boolean;
  isSeller: boolean;
  initialBuyerSignature: string | null;
  initialSellerSignature: string | null;
}) {
  const [contract, setContract] = useState<string | null>(initialContract);
  const [broker, setBroker] = useState<BrokerInfo>(initialBroker);
  const [candidates, setCandidates] = useState<
    Array<{
      id: string;
      name: string;
      brokerLicense: string | null;
      brokerOffice: string | null;
      brokerRegion: string | null;
      verifiedAt: string | null;
      matchReason: string;
      score: number;
    }>
  >([]);
  const [showCandidates, setShowCandidates] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showContract, setShowContract] = useState(false);
  const [buyerSig, setBuyerSig] = useState<string | null>(initialBuyerSignature);
  const [sellerSig, setSellerSig] = useState<string | null>(initialSellerSignature);
  const [showSignPad, setShowSignPad] = useState(false);

  async function saveSignature(dataUrl: string) {
    const res = await fetch(`/api/deals/${dealId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: dataUrl }),
    });
    if (res.ok) {
      if (isBuyer) setBuyerSig(dataUrl);
      else setSellerSig(dataUrl);
      setShowSignPad(false);
      // 계약서가 이미 생성됐다면 서명을 반영해 재생성
      if (contract) {
        const regen = await fetch(`/api/deals/${dealId}/contract`, { method: "POST" });
        if (regen.ok) {
          const j = await regen.json();
          setContract(j.contract);
        }
      }
    }
  }

  async function loadCandidates() {
    setLoadingCandidates(true);
    setShowCandidates(true);
    setError("");
    try {
      const res = await fetch(`/api/deals/${dealId}/broker-candidates`);
      if (res.ok) {
        const j = await res.json();
        setCandidates(j.candidates);
      }
    } finally {
      setLoadingCandidates(false);
    }
  }

  async function assignBroker(brokerId?: string) {
    setAssigning(true);
    setError("");
    try {
      const res = await fetch(`/api/deals/${dealId}/assign-broker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brokerId ? { brokerId } : {}),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "배정 실패");
        return;
      }
      const j = await res.json();
      setBroker(j.deal.broker);
      setShowCandidates(false);
    } finally {
      setAssigning(false);
    }
  }

  // 딜 페이지 진입 시 자동으로 후보 미리 로드 (매도인이고 broker 미배정 상태일 때만)
  useEffect(() => {
    if (isSeller && !broker && candidates.length === 0) {
      loadCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateContract() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/deals/${dealId}/contract`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "생성 실패");
        return;
      }
      const j = await res.json();
      setContract(j.contract);
      setShowContract(true);
    } finally {
      setGenerating(false);
    }
  }

  const mySigDone = isBuyer ? !!buyerSig : isSeller ? !!sellerSig : false;
  const bothSigned = !!buyerSig && !!sellerSig;
  // Phase 1: 대학가 월세 간소화 흐름
  const steps: Step[] = [
    { key: "match", label: "매칭 완료", desc: "양측 월세·보증금 합의", status: "DONE" },
    {
      key: "verify",
      label: "본인 인증",
      desc: "PASS / NICE 실명 확인 (방 사기 예방)",
      status: "READY",
      action: "/me에서 실행",
    },
    {
      key: "registry",
      label: "등기부 검증",
      desc: "집주인 명의·근저당 자동 확인",
      status: "READY",
      action: "매물 페이지에서 조회",
    },
    {
      key: "contract",
      label: "표준 임대차 계약서 생성",
      desc: "국토부 표준 양식으로 자동 작성",
      status: contract ? "DONE" : "READY",
      action: contract ? "보기" : "생성",
    },
    {
      key: "sign",
      label: "전자 서명",
      desc: bothSigned
        ? "양측 서명 완료"
        : mySigDone
        ? "내 서명 완료, 상대방 대기"
        : "캔버스에 직접 서명",
      status: bothSigned ? "DONE" : "READY",
    },
    {
      key: "escrow",
      label: "보증금 에스크로",
      desc: "피치마켓 에스크로에 안전 보관",
      status: "READY",
      action: "위 카드에서 송금",
    },
    { key: "complete", label: "입주 완료", desc: "보증금 집주인 전달 + 거래 종결", status: "PENDING" },
  ];

  return (
    <section className="border rounded-lg bg-white p-4">
      <h2 className="font-bold mb-1">🚀 거래 자동화 진행 단계</h2>
      <p className="text-xs text-neutral-500 mb-4">
        피치마켓이 매칭부터 등기 이전까지 한 번에 처리합니다. 각 단계는 자동/반자동으로 진행됩니다.
      </p>

      {/* Phase 1: 중개사 플로우 전체 숨김. 무료 직거래 모드. */}
      {SHOW_BROKER && broker ? (
        <div className="mb-4 border-2 border-blue-300 bg-blue-50 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              {broker.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-blue-700 font-semibold">
                ⚖️ 검토 중인 공인중개사
              </div>
              <div className="font-bold">
                {broker.name}{" "}
                <span className="text-xs font-normal text-neutral-500">
                  ({broker.brokerOffice})
                </span>
              </div>
              <div className="text-[11px] text-neutral-600">
                자격 {broker.brokerLicense} · {broker.brokerRegion}
              </div>
              <div className="text-[11px] text-blue-700 mt-1">
                이 중개사가 모든 서류를 검토하고 최종 서명을 책임집니다.
              </div>
            </div>
          </div>
        </div>
      ) : SHOW_BROKER && isSeller ? (
        <div className="mb-4 border-2 border-blue-200 bg-blue-50 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-blue-900">
                ⚖️ 검토 공인중개사를 골라주세요 (매도인 권한)
              </div>
              <div className="text-xs text-neutral-600 mt-0.5">
                지역 전문 중개사가 자동 추천됩니다. 직접 선택하거나 AI 자동 배정을 사용하세요.
              </div>
            </div>
            <button
              onClick={() => assignBroker()}
              disabled={assigning}
              className="bg-white border border-blue-600 text-blue-600 text-xs font-bold px-3 py-2 rounded shrink-0 disabled:opacity-50"
            >
              {assigning ? "매칭 중..." : "🤖 AI 자동 배정"}
            </button>
          </div>

          {loadingCandidates && (
            <p className="text-xs text-neutral-500">추천 중개사를 불러오는 중...</p>
          )}

          {showCandidates && candidates.length > 0 && (
            <div className="space-y-2">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border rounded-lg p-3 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {c.name}
                        {c.verifiedAt && <span className="text-green-600"> ✓</span>}
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded font-bold">
                        매칭 {c.score}점
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600">
                      {c.brokerOffice} · {c.brokerRegion}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      자격 {c.brokerLicense}
                    </div>
                    <div className="text-[11px] text-blue-700 mt-0.5">
                      💡 {c.matchReason}
                    </div>
                  </div>
                  <button
                    onClick={() => assignBroker(c.id)}
                    disabled={assigning}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded shrink-0 disabled:opacity-50"
                  >
                    선택
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : SHOW_BROKER ? (
        <div className="mb-4 border-2 border-neutral-200 bg-neutral-50 rounded-lg p-3">
          <div className="text-sm font-semibold text-neutral-700">
            ⏳ 매도인이 검토 공인중개사를 선택 중입니다.
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            매도인이 중개사를 배정하면 자동으로 알림을 받게 됩니다.
          </div>
        </div>
      ) : null}

      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li
            key={s.key}
            className={`flex items-start gap-3 p-3 rounded border ${
              s.status === "DONE"
                ? "bg-green-50 border-green-200"
                : s.status === "READY"
                ? "bg-blue-50 border-blue-200"
                : "bg-neutral-50 border-neutral-200 opacity-70"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                s.status === "DONE"
                  ? "bg-green-600 text-white"
                  : s.status === "READY"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-300 text-white"
              }`}
            >
              {s.status === "DONE" ? "✓" : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{s.label}</div>
              <div className="text-xs text-neutral-500">{s.desc}</div>
            </div>
            {s.key === "contract" && s.status === "READY" && (
              <button
                onClick={generateContract}
                disabled={generating}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold disabled:opacity-50"
              >
                {generating ? "작성 중..." : "📄 생성"}
              </button>
            )}
            {s.key === "contract" && s.status === "DONE" && (
              <button
                onClick={() => setShowContract((v) => !v)}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-bold"
              >
                {showContract ? "닫기" : "보기"}
              </button>
            )}
            {s.key === "sign" && !mySigDone && (
              <button
                onClick={() => setShowSignPad((v) => !v)}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold"
              >
                서명하기
              </button>
            )}
            {s.key === "sign" && mySigDone && (
              <span className="text-xs text-green-700 font-bold">✓ 서명 완료</span>
            )}
            {s.action && s.status === "PENDING" && (
              <span className="text-[10px] text-neutral-400">{s.action}</span>
            )}
          </li>
        ))}
      </ol>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {/* 서명 캔버스 */}
      {showSignPad && (isBuyer || isSeller) && (
        <div className="mt-4 border-2 border-blue-300 rounded-lg p-4 bg-white">
          <h3 className="font-bold text-sm mb-2">
            ✍️ {isBuyer ? "매수인" : "매도인"} 전자서명
          </h3>
          <p className="text-xs text-neutral-500 mb-2">
            아래 영역에 마우스나 손가락으로 서명해주세요.
          </p>
          <SignaturePad onSave={saveSignature} />
        </div>
      )}

      {/* 저장된 서명 표시 */}
      {(buyerSig || sellerSig) && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {sellerSig && (
            <div className="border rounded p-2 bg-white">
              <div className="text-[10px] text-neutral-500 font-semibold mb-1">매도인 서명</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sellerSig} alt="매도인 서명" className="max-h-20 mx-auto" />
            </div>
          )}
          {buyerSig && (
            <div className="border rounded p-2 bg-white">
              <div className="text-[10px] text-neutral-500 font-semibold mb-1">매수인 서명</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={buyerSig} alt="매수인 서명" className="max-h-20 mx-auto" />
            </div>
          )}
        </div>
      )}

      {showContract && contract && (
        <div className="mt-4 border-2 border-blue-300 rounded overflow-hidden bg-white">
          <div className="flex items-center justify-between p-3 border-b bg-neutral-50">
            <h3 className="font-bold text-sm">📄 표준 부동산 계약서</h3>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="text-xs bg-neutral-200 text-neutral-700 px-3 py-1 rounded font-semibold"
              >
                🖨️ 인쇄
              </button>
              <button
                onClick={() => setShowContract(false)}
                className="text-xs text-neutral-500 px-2"
              >
                닫기
              </button>
            </div>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            <ContractDocument
              markdown={contract}
              sellerSignature={sellerSig}
              buyerSignature={buyerSig}
            />
          </div>
          <p className="text-[10px] text-neutral-400 italic p-3 border-t">
            ⚠️ 본 계약서는 표준 양식으로 자동 작성된 초안입니다. 실거래 시 공인중개사·법무사 검토 후 서명해주세요.
          </p>
        </div>
      )}
    </section>
  );
}
