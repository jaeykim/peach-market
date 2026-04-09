"use client";

import { useEffect, useMemo, useState } from "react";

type Block = { start: string; end: string; confirmed: boolean };

export default function RentalCalendar({
  listingId,
  startDate,
  endDate,
  onChange,
  minDays = 7,
}: {
  listingId: string;
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  minDays?: number;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [pickingEnd, setPickingEnd] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/blocked-dates`)
      .then((r) => r.json())
      .then((j) => setBlocks(j.blocks || []));
  }, [listingId]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  function ymd(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function isBlocked(d: Date): boolean {
    const s = ymd(d);
    return blocks.some((b) => s >= b.start && s < b.end);
  }

  function inSelectedRange(d: Date): boolean {
    if (!startDate) return false;
    const s = ymd(d);
    if (!endDate) return s === startDate;
    return s >= startDate && s <= endDate;
  }

  function clickDay(d: Date) {
    if (d < today || isBlocked(d)) return;
    const s = ymd(d);
    if (!startDate || pickingEnd === false || s < startDate) {
      onChange(s, null);
      setPickingEnd(true);
      return;
    }
    // 종료일 선택 시 최소 기간 검증
    const start = new Date(startDate);
    const days = Math.round((d.getTime() - start.getTime()) / 86400000);
    if (days < minDays) {
      onChange(s, null);
      setPickingEnd(true);
      return;
    }
    // 사이에 블락된 날짜가 있는지 검사
    for (let i = 1; i < days; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      if (isBlocked(cur)) {
        onChange(s, null);
        setPickingEnd(true);
        return;
      }
    }
    onChange(startDate, s);
    setPickingEnd(false);
  }

  function reset() {
    onChange(null, null);
    setPickingEnd(false);
  }

  function buildMonth(year: number, month: number) {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay(); // 0=일
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  const baseDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  function renderMonth(offset: number) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const cells = buildMonth(year, month);
    return (
      <div key={`${year}-${month}`} className="flex-1 min-w-0">
        <div className="text-center font-bold text-sm mb-2">
          {year}년 {month + 1}월
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-[10px] text-neutral-500 mb-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} className="text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const past = d < today;
            const blocked = isBlocked(d);
            const selected = inSelectedRange(d);
            const isStart = startDate && ymd(d) === startDate;
            const isEnd = endDate && ymd(d) === endDate;
            const cls = past
              ? "text-neutral-300 cursor-not-allowed"
              : blocked
              ? "bg-neutral-200 text-neutral-400 line-through cursor-not-allowed"
              : isStart || isEnd
              ? "bg-pink-600 text-white font-bold cursor-pointer"
              : selected
              ? "bg-pink-100 text-pink-700 cursor-pointer"
              : "hover:bg-pink-50 cursor-pointer";
            return (
              <button
                key={i}
                type="button"
                disabled={past || blocked}
                onClick={() => clickDay(d)}
                className={`aspect-square text-xs rounded ${cls}`}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const days =
    startDate && endDate
      ? Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
        ) + 1
      : 0;

  return (
    <div className="border rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o - 1)}
          disabled={monthOffset <= 0}
          className="text-sm px-2 py-1 rounded hover:bg-neutral-100 disabled:opacity-30"
        >
          ‹ 이전
        </button>
        <div className="text-xs text-neutral-500">
          {pickingEnd ? "종료일을 선택해주세요" : "시작일을 선택해주세요"} · 최소 {minDays}일
        </div>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o + 1)}
          className="text-sm px-2 py-1 rounded hover:bg-neutral-100"
        >
          다음 ›
        </button>
      </div>

      <div className="flex gap-3">
        {renderMonth(0)}
        {renderMonth(1)}
      </div>

      <div className="mt-3 pt-3 border-t flex items-center gap-3 text-xs">
        <Legend color="bg-pink-600" label="선택" />
        <Legend color="bg-pink-100" label="범위" />
        <Legend color="bg-neutral-200" label="예약됨" />
      </div>

      {startDate && (
        <div className="mt-3 p-2 bg-pink-50 rounded text-sm">
          <div className="flex items-center justify-between">
            <div>
              <strong>{startDate}</strong>
              {endDate && <> ~ <strong>{endDate}</strong> · {days}일</>}
              {!endDate && <span className="text-neutral-500"> ~ ?</span>}
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-neutral-500 underline"
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-neutral-600">{label}</span>
    </div>
  );
}
