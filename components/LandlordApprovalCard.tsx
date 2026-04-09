"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandlordApprovalCard({
  dealId,
  isSeller,
  status,
  earnestMoney,
  buyerName,
  rejectReason,
}: {
  dealId: string;
  isSeller: boolean;
  status: string | null; // PENDING / APPROVED / REJECTED
  earnestMoney: number | null;
  buyerName: string;
  rejectReason: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function act(action: "APPROVE" | "REJECT") {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/deals/${dealId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: action === "REJECT" ? reason : undefined }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "처리 실패");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "APPROVED") {
    return (
      <section className="border-2 border-green-300 rounded-lg bg-green-50 p-4">
        <h2 className="font-bold text-green-900">✓ 신청 수락 완료</h2>
        <p className="text-sm text-green-800 mt-1">
          집주인이 신청을 수락했습니다. 이제 계약서 검토·서명 단계로 진행됩니다.
        </p>
      </section>
    );
  }

  if (status === "REJECTED") {
    return (
      <section className="border-2 border-red-300 rounded-lg bg-red-50 p-4">
        <h2 className="font-bold text-red-900">❌ 신청 거절</h2>
        <p className="text-sm text-red-800 mt-1">
          집주인이 신청을 거절했습니다. 가계약금은 자동 환불됩니다.
        </p>
        {rejectReason && (
          <p className="text-xs text-neutral-700 mt-2 bg-white rounded px-2 py-1">
            사유: {rejectReason}
          </p>
        )}
      </section>
    );
  }

  // PENDING
  if (!isSeller) {
    return (
      <section className="border-2 border-yellow-300 rounded-lg bg-yellow-50 p-4">
        <h2 className="font-bold text-yellow-900">⏳ 집주인 수락 대기 중</h2>
        <p className="text-sm text-yellow-800 mt-1">
          가계약금 <strong>{earnestMoney?.toLocaleString()}만원</strong>이 피치마켓 에스크로에 보관되었습니다.
          집주인이 신청을 수락하면 계약서가 자동으로 작성됩니다.
        </p>
        <p className="text-xs text-neutral-600 mt-2">
          거절되면 가계약금은 전액 환불됩니다.
        </p>
      </section>
    );
  }

  // Seller view
  return (
    <section className="border-2 border-pink-300 rounded-lg bg-pink-50 p-4">
      <h2 className="font-bold">📩 새 입주 신청</h2>
      <div className="mt-2 text-sm bg-white border rounded p-3">
        <div>
          신청자: <strong>{buyerName}</strong>
        </div>
        <div>
          가계약금: <strong>{earnestMoney?.toLocaleString()}만원</strong>{" "}
          <span className="text-xs text-green-700">✓ 에스크로 보관 중</span>
        </div>
      </div>
      <p className="text-xs text-neutral-600 mt-2 mb-3">
        수락하면 계약서가 자동 생성됩니다. 거절하면 가계약금이 임차인에게 환불됩니다.
      </p>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {!showReject ? (
        <div className="flex gap-2">
          <button
            onClick={() => act("APPROVE")}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded text-sm disabled:opacity-50"
          >
            {loading ? "처리 중..." : "✓ 수락"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading}
            className="bg-neutral-200 text-neutral-700 px-4 py-2 rounded text-sm"
          >
            거절
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            placeholder="거절 사유 (선택)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-xs"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => act("REJECT")}
              disabled={loading}
              className="flex-1 bg-red-600 text-white font-bold py-2 rounded text-sm"
            >
              거절 확정
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="bg-neutral-200 text-neutral-700 px-3 py-2 rounded text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
