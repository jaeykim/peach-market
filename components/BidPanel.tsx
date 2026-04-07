"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Bid = {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  parentBidId: string | null;
  createdAt: string;
  proposer: { id: string; name: string };
};

export default function BidPanel({
  listingId,
  listingSide,
  askingPrice,
  isOwner,
  isLoggedIn,
  isClosed,
}: {
  listingId: string;
  listingSide: string;
  askingPrice: number;
  isOwner: boolean;
  isLoggedIn: boolean;
  isClosed: boolean;
}) {
  const router = useRouter();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [parentBidId, setParentBidId] = useState<string | null>(null);
  const [fairPrice, setFairPrice] = useState<{
    estimate: number;
    low: number;
    high: number;
    reasoning: string;
    source: string;
  } | null>(null);
  const [fpLoading, setFpLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadBids() {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/listings/${listingId}/bids`);
    if (res.ok) {
      const j = await res.json();
      setBids(j.bids);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/listings/${listingId}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseInt(amount, 10),
        message: message || undefined,
        parentBidId: parentBidId || undefined,
      }),
    });
    if (!res.ok) {
      const j = await res.json();
      setError(typeof j.error === "string" ? j.error : "제안 실패");
      return;
    }
    setAmount("");
    setMessage("");
    setParentBidId(null);
    await loadBids();
    router.refresh();
  }

  async function action(bidId: string, action: "ACCEPT" | "REJECT" | "WITHDRAW") {
    const res = await fetch(`/api/bids/${bidId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
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
    await loadBids();
    router.refresh();
  }

  async function getFairPrice() {
    setFpLoading(true);
    const res = await fetch(`/api/listings/${listingId}/fair-price`);
    if (res.ok) setFairPrice(await res.json());
    setFpLoading(false);
  }

  if (!isLoggedIn) {
    return (
      <div className="border rounded-lg bg-white p-4 text-sm">
        <p>가격 제안을 하려면 <Link href="/login" className="text-pink-600 font-semibold">로그인</Link>이 필요합니다.</p>
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

  // 그룹핑: 매물 소유자가 보면 다른 협상 스레드들이 보임. 일반 사용자는 본인 스레드만.
  const threads = groupByThread(bids);

  return (
    <div className="border rounded-lg bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {isOwner ? "받은 제안 (비공개)" : "내가 보낸 제안"}
        </h3>
        <button
          onClick={getFairPrice}
          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold"
          disabled={fpLoading}
        >
          {fpLoading ? "분석 중..." : "✨ AI 적정가"}
        </button>
      </div>

      {fairPrice && (
        <div className="border-l-4 border-purple-400 bg-purple-50 p-3 text-sm rounded">
          <div className="font-bold text-purple-900">
            AI 적정가: {formatPrice(fairPrice.estimate)}
          </div>
          <div className="text-xs text-purple-700">
            범위 {formatPrice(fairPrice.low)} ~ {formatPrice(fairPrice.high)}
          </div>
          <p className="text-xs mt-1 text-purple-800">{fairPrice.reasoning}</p>
          <p className="text-[10px] text-purple-500 mt-1">source: {fairPrice.source}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">불러오는 중...</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {isOwner ? "아직 받은 제안이 없습니다." : "아직 보낸 제안이 없습니다."}
        </p>
      ) : (
        <div className="space-y-3">
          {threads.map((thread, i) => (
            <div key={i} className="border rounded p-2 space-y-1">
              {thread.map((b) => (
                <div key={b.id} className="text-sm flex items-start justify-between gap-2">
                  <div>
                    <div>
                      <span className="font-semibold">{b.proposer.name}</span>{" "}
                      <span className="text-pink-600 font-bold">{formatPrice(b.amount)}</span>{" "}
                      <span className="text-xs text-neutral-500">[{statusLabel(b.status)}]</span>
                    </div>
                    {b.message && <div className="text-xs text-neutral-600">{b.message}</div>}
                  </div>
                  {b.status === "PENDING" && (
                    <div className="flex gap-1 shrink-0">
                      {/* 본인 제안이면 철회만 */}
                      <BidActions
                        bid={b}
                        isOwner={isOwner}
                        onAction={action}
                        onCounter={() => setParentBidId(b.id)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {!isOwner || threads.length > 0 ? (
        <form onSubmit={submitBid} className="space-y-2 pt-3 border-t">
          {parentBidId && (
            <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded flex justify-between">
              <span>카운터오퍼 작성 중</span>
              <button type="button" onClick={() => setParentBidId(null)}>취소</button>
            </div>
          )}
          <input
            type="number"
            placeholder={`가격 (원) - 등록가 ${formatPrice(askingPrice)}`}
            className="w-full border rounded px-3 py-2 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <textarea
            placeholder="메시지 (선택)"
            className="w-full border rounded px-3 py-2 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isOwner && !parentBidId}
            className="w-full bg-pink-600 text-white py-2 rounded font-semibold text-sm disabled:bg-neutral-300"
          >
            {isOwner ? "카운터오퍼 보내기" : listingSide === "SELL" ? "가격 제안하기" : "매도가 제안하기"}
          </button>
        </form>
      ) : null}

      <p className="text-[11px] text-neutral-500">
        🔒 협상 내용은 당사자 외 누구에게도 공개되지 않습니다.
      </p>
    </div>
  );
}

function BidActions({
  bid,
  onAction,
  onCounter,
}: {
  bid: Bid;
  isOwner: boolean;
  onAction: (id: string, a: "ACCEPT" | "REJECT" | "WITHDRAW") => void;
  onCounter: () => void;
}) {
  // 본인 제안은 철회만 가능
  // 이 컴포넌트에서는 현재 사용자가 누구인지 모르므로 owner는 ACCEPT/REJECT/COUNTER, 그렇지 않은 경우 ACCEPT(상대 카운터)
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onAction(bid.id, "ACCEPT")}
        className="text-xs bg-green-600 text-white px-2 py-0.5 rounded"
      >
        수락
      </button>
      <button
        onClick={() => onAction(bid.id, "REJECT")}
        className="text-xs bg-neutral-200 px-2 py-0.5 rounded"
      >
        거절
      </button>
      <button
        onClick={onCounter}
        className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
      >
        카운터
      </button>
    </div>
  );
}

function groupByThread(bids: Bid[]): Bid[][] {
  // 부모-자식 체인으로 그룹화. 루트는 parentBidId가 null인 비드.
  const byParent = new Map<string | null, Bid[]>();
  for (const b of bids) {
    const k = b.parentBidId;
    const arr = byParent.get(k) || [];
    arr.push(b);
    byParent.set(k, arr);
  }
  const threads: Bid[][] = [];
  const roots = byParent.get(null) || [];
  for (const root of roots) {
    const chain: Bid[] = [root];
    let curId: string = root.id;
    while (true) {
      const kids: Bid[] = byParent.get(curId) || [];
      if (!kids.length) break;
      chain.push(kids[0]);
      curId = kids[0].id;
    }
    threads.push(chain);
  }
  return threads;
}

function formatPrice(won: number) {
  if (won >= 100_000_000) {
    const eok = Math.floor(won / 100_000_000);
    const man = Math.round((won % 100_000_000) / 10_000);
    return man ? `${eok}억 ${man.toLocaleString()}만` : `${eok}억`;
  }
  return `${Math.round(won / 10_000).toLocaleString()}만`;
}

function statusLabel(s: string) {
  return ({ PENDING: "대기", ACCEPTED: "수락", REJECTED: "거절", COUNTERED: "카운터", WITHDRAWN: "철회" } as Record<string, string>)[s] || s;
}
