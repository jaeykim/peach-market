"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; name: string };
  target: { id: string; name: string };
};

export default function ReviewSection({
  dealId,
  currentUserId,
  enabled,
}: {
  dealId: string;
  currentUserId: string;
  enabled: boolean; // COMPLETED 일 때만
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/deals/${dealId}/reviews`);
    if (res.ok) {
      const j = await res.json();
      setReviews(j.reviews);
    }
  }

  useEffect(() => {
    if (enabled) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId, enabled]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/deals/${dealId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "저장 실패");
        return;
      }
      setComment("");
      await load();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!enabled) return null;

  const myReview = reviews.find((r) => r.author.id === currentUserId);

  return (
    <section className="border rounded-lg bg-white p-4">
      <h2 className="font-bold">⭐ 거래 후기</h2>
      <p className="text-xs text-neutral-500 mt-0.5 mb-3">
        거래 상대방에게 별점과 짧은 후기를 남겨주세요.
      </p>

      {reviews.length > 0 && (
        <ul className="space-y-2 mb-4">
          {reviews.map((r) => (
            <li key={r.id} className="border rounded p-3 bg-neutral-50">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {r.author.name} → {r.target.name}
                </div>
                <div className="text-yellow-500">
                  {"★".repeat(r.rating)}
                  <span className="text-neutral-300">{"★".repeat(5 - r.rating)}</span>
                </div>
              </div>
              {r.comment && (
                <p className="text-xs text-neutral-700 mt-1">{r.comment}</p>
              )}
              <div className="text-[10px] text-neutral-400 mt-1">
                {new Date(r.createdAt).toLocaleString("ko-KR")}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!myReview && (
        <form onSubmit={submit} className="space-y-2">
          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1">
              별점
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl ${n <= rating ? "text-yellow-500" : "text-neutral-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="후기 (선택) — 집 상태, 집주인 응대 등"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm min-h-[70px]"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="bg-pink-600 text-white font-bold px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {saving ? "저장 중..." : "후기 남기기"}
          </button>
        </form>
      )}
    </section>
  );
}
