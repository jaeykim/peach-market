"use client";

import { useState } from "react";

const REASONS = [
  { value: "FAKE", label: "허위 매물 (실제 존재하지 않음)" },
  { value: "SCAM", label: "사기 의심" },
  { value: "WRONG_INFO", label: "정보 불일치 (주소·면적·가격 등)" },
  { value: "OTHER", label: "기타" },
];

export default function ReportButton({
  listingId,
  loggedIn,
}: {
  listingId: string;
  loggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("FAKE");
  const [detail, setDetail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${listingId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail: detail || undefined }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "신고 실패");
        return;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
        ✓ 신고가 접수되었습니다. 검토 후 조치하겠습니다.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-neutral-500 hover:text-red-600 underline"
      >
        🚩 이 매물 신고
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="border border-red-200 bg-red-50 rounded p-3 space-y-2 text-sm"
    >
      <div className="font-semibold text-red-800">🚩 매물 신고</div>
      <div>
        <label className="text-xs font-semibold text-neutral-600 block mb-1">
          신고 사유
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-sm bg-white"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="상세 내용 (선택)"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        className="w-full border rounded px-2 py-1.5 text-xs min-h-[60px]"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded disabled:opacity-50"
        >
          {sending ? "접수 중..." : "신고하기"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-neutral-500 px-2"
        >
          취소
        </button>
      </div>
    </form>
  );
}
