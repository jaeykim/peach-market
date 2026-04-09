"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteDealButton({
  dealId,
  canComplete,
  alreadyCompleted,
}: {
  dealId: string;
  canComplete: boolean;
  alreadyCompleted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    if (!window.confirm("입주가 완료되었나요? 확정하면 에스크로가 임대인에게 송금됩니다.")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/deals/${dealId}/complete`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "확정 실패");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (alreadyCompleted) {
    return (
      <section className="border-2 border-green-400 rounded-lg bg-green-50 p-4">
        <h2 className="font-bold text-green-900">🎉 입주가 확정되었습니다</h2>
        <p className="text-sm text-green-800 mt-1">
          에스크로 보관 금액이 임대인에게 송금되었습니다. 거래 완료.
        </p>
      </section>
    );
  }

  if (!canComplete) return null;

  return (
    <section className="border-2 border-pink-300 rounded-lg bg-pink-50/50 p-4">
      <h2 className="font-bold">🏠 입주 확정</h2>
      <p className="text-sm text-neutral-600 mt-1 mb-3">
        입주 후 이상이 없다면 확정해주세요. 에스크로 보관 금액이 임대인에게 자동 송금됩니다.
      </p>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        onClick={confirm}
        disabled={loading}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-4 py-2.5 rounded disabled:opacity-50"
      >
        {loading ? "처리 중..." : "✅ 입주 확정 · 에스크로 해제"}
      </button>
    </section>
  );
}
