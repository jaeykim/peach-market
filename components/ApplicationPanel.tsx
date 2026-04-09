"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Phase 1: 가격 협상 없이 "신청 → 수락/거절" 단순 흐름
// 내부적으로는 Bid 테이블을 재사용하되 amount는 항상 listing.askingPrice 고정

type Application = {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  createdAt: string;
  proposer: { id: string; name: string };
};

export default function ApplicationPanel({
  listingId,
  askingPrice,
  isOwner,
  currentUserId,
  isLoggedIn,
  isClosed,
}: {
  listingId: string;
  askingPrice: number;
  isOwner: boolean;
  currentUserId: string | null;
  isLoggedIn: boolean;
  isClosed: boolean;
}) {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/listings/${listingId}/bids`);
    if (res.ok) {
      const j = await res.json();
      // 루트 bid만 (카운터 체인 무시 — Phase 1엔 카운터 없음)
      const roots = (j.bids as Application[]).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (b: any) => !b.parentBidId,
      );
      setApps(roots);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: askingPrice, // 고정
          message: message || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : "신청 실패");
        return;
      }
      setMessage("");
      await load();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function action(appId: string, act: "ACCEPT" | "REJECT" | "WITHDRAW") {
    const res = await fetch(`/api/bids/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    if (!res.ok) {
      const j = await res.json();
      setError(typeof j.error === "string" ? j.error : "처리 실패");
      return;
    }
    const j = await res.json();
    if (j.dealId) {
      router.push(`/deals/${j.dealId}`);
      return;
    }
    await load();
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <div className="border rounded-lg bg-white p-4 text-sm">
        <p>
          이 방을 신청하려면{" "}
          <Link href="/login" className="text-pink-600 font-semibold">
            로그인
          </Link>
          이 필요합니다.
        </p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="border rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600">
        마감된 매물입니다.
      </div>
    );
  }

  // 내가 이미 신청했는지
  const myApp = apps.find((a) => a.proposer.id === currentUserId);

  return (
    <div className="border rounded-lg bg-white p-4 space-y-3">
      <div>
        <h3 className="font-bold">{isOwner ? "📩 받은 신청" : "📝 이 방 신청"}</h3>
        <p className="text-[11px] text-neutral-500 mt-0.5">
          🔒 다른 사용자에게는 공개되지 않습니다
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중...</p>
      ) : apps.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {isOwner ? "아직 받은 신청이 없습니다." : "첫 신청을 보내보세요."}
        </p>
      ) : (
        <div className="space-y-2">
          {apps.map((a) => {
            const mine = currentUserId === a.proposer.id;
            return (
              <div
                key={a.id}
                className="border rounded p-3 bg-neutral-50 flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">
                    {mine ? "내 신청" : a.proposer.name}{" "}
                    <span className="text-xs text-neutral-500 font-normal">
                      [{statusLabel(a.status)}]
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(a.createdAt).toLocaleString("ko-KR")}
                  </div>
                  {a.message && (
                    <div className="text-xs text-neutral-700 mt-1 bg-white rounded px-2 py-1">
                      💬 {a.message}
                    </div>
                  )}
                </div>
                {a.status === "PENDING" && (
                  <div className="flex flex-col gap-1 shrink-0">
                    {mine ? (
                      <button
                        onClick={() => action(a.id, "WITHDRAW")}
                        className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded font-semibold"
                      >
                        신청 취소
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => action(a.id, "ACCEPT")}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded font-bold"
                        >
                          수락
                        </button>
                        <button
                          onClick={() => action(a.id, "REJECT")}
                          className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded font-semibold"
                        >
                          거절
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 신청 폼: 매물 소유자는 안 보임, 이미 신청했으면 안 보임 */}
      {!isOwner && !myApp && (
        <form onSubmit={submit} className="space-y-2 pt-3 border-t">
          <div className="bg-pink-50 border border-pink-200 rounded p-2 text-xs">
            등록된 금액 <strong>{askingPrice.toLocaleString()}만원</strong> 그대로
            신청됩니다.
          </div>
          <textarea
            placeholder="집주인에게 남길 메시지 (선택) — 입주 가능 시점, 직업 등"
            className="w-full border rounded px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-pink-600 text-white py-2.5 rounded font-bold text-sm disabled:opacity-50"
          >
            {submitting ? "신청 중..." : "📝 이 방 신청하기"}
          </button>
        </form>
      )}
    </div>
  );
}

function statusLabel(s: string) {
  return (
    ({
      PENDING: "대기",
      ACCEPTED: "수락",
      REJECTED: "거절",
      COUNTERED: "카운터",
      WITHDRAWN: "철회",
    } as Record<string, string>)[s] || s
  );
}
