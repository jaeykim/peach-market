"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOwnershipButton({
  listingId,
  initialVerified,
}: {
  listingId: string;
  initialVerified: boolean;
}) {
  const router = useRouter();
  const [verified, setVerified] = useState(initialVerified);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function verify() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/listings/${listingId}/verify-ownership`, {
        method: "POST",
      });
      const j = await res.json();
      if (!res.ok) {
        setMessage(j.error || "검증 실패");
        return;
      }
      if (j.matched) {
        setVerified(true);
        setMessage(
          `✅ 등기부 소유자 "${j.registryOwner}"와 일치합니다.`,
        );
        router.refresh();
      } else {
        setMessage(
          `⚠️ 등기부 소유자 "${j.registryOwner}" ≠ 등록자 "${j.listingOwner}". 등기부와 본인 이름이 일치해야 합니다.`,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
        ✓ 소유권 검증 완료
      </span>
    );
  }

  return (
    <div className="mt-1">
      <button
        onClick={verify}
        disabled={loading}
        className="text-[11px] bg-blue-600 text-white px-2 py-1 rounded font-semibold disabled:opacity-50"
      >
        {loading ? "등기부 조회 중..." : "🏛️ 소유권 검증"}
      </button>
      {message && (
        <p
          className={`text-[11px] mt-1 ${
            message.startsWith("✅") ? "text-green-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
