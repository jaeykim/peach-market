"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const [hint, setHint] = useState<string>("");
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  function fromYmd(s: string): Date {
    const [y, m, d] = s.split("-").map((x) => parseInt(x, 10));
    return new Date(y, m - 1, d);
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

  // 시작일에서 days일 후까지 블락 없이 가능한지 검사
  // 가능하면 끝 날짜 반환, 아니면 null
  function findValidEnd(start: Date, days: number): Date | null {
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    for (let i = 0; i < days; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      if (isBlocked(cur)) return null;
    }
    return end;
  }

  function clickDay(d: Date) {
    setHint("");
    if (d < today || isBlocked(d)) return;
    const s = ymd(d);

    // 1) 시작 날짜를 클릭한 경우 (또는 새로 시작)
    //    - startDate가 없거나
    //    - 클릭한 날짜가 현재 startDate보다 이전이거나
    //    - 현재 endDate가 없는 상태
    if (!startDate || s < startDate || !endDate) {
      const start = fromYmd(s);
      const autoEnd = findValidEnd(start, minDays);
      if (!autoEnd) {
        setHint(
          `이 시작일부터 최소 기간 ${minDays}일 안에 이미 예약된 날이 있어요. 다른 날짜를 골라보세요.`,
        );
        onChange(null, null);
        return;
      }
      onChange(s, ymd(autoEnd));
      return;
    }

    // 2) 종료일 변경 (현재 startDate 이후를 클릭)
    const start = fromYmd(startDate);
    const days = Math.round((d.getTime() - start.getTime()) / 86400000) + 1;
    if (days < minDays) {
      // 너무 짧으면 minDays까지 자동 연장
      const auto = findValidEnd(start, minDays);
      if (auto) {
        onChange(startDate, ymd(auto));
        setHint(`최소 ${minDays}일이라 자동으로 ${ymd(auto)}까지 연장되었어요.`);
      }
      return;
    }
    // 중간에 블락 있는지 검사
    for (let i = 1; i < days; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      if (isBlocked(cur)) {
        setHint("선택한 범위 내에 이미 예약된 날이 있어요.");
        return;
      }
    }
    onChange(startDate, s);
  }

  function reset() {
    onChange(null, null);
    setHint("");
  }

  // 캘린더 뷰를 특정 날짜가 보이도록 이동
  function jumpTo(target: string) {
    const t = fromYmd(target);
    const months =
      (t.getFullYear() - today.getFullYear()) * 12 +
      (t.getMonth() - today.getMonth());
    setMonthOffset(Math.max(0, months));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // 가로 스와이프만 (세로 스크롤과 구분)
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx > 0) setMonthOffset((o) => Math.max(0, o - 1));
    else setMonthOffset((o) => o + 1);
  }

  function shift(deltaDays: number) {
    if (!startDate || !endDate) return;
    const start = fromYmd(startDate);
    const end = fromYmd(endDate);
    end.setDate(end.getDate() + deltaDays);
    if (end < start) return;
    const newDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    if (newDays < minDays) return;
    // 블락 검사
    for (let i = 0; i < newDays; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      if (isBlocked(cur)) {
        setHint("연장할 수 없는 날짜에 막혀있어요.");
        return;
      }
    }
    setHint("");
    onChange(startDate, ymd(end));
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
        <div className="text-xs text-neutral-500 text-center">
          {!startDate
            ? `시작일을 누르면 ${minDays}일이 자동 선택돼요`
            : "다른 날을 눌러 기간을 조정하세요"}
          <div className="text-[10px] text-neutral-400 mt-0.5 hidden sm:block">
            👆 좌우 스와이프 또는 ‹ › 버튼
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o + 1)}
          className="text-sm px-2 py-1 rounded hover:bg-neutral-100"
        >
          다음 ›
        </button>
      </div>

      <div
        className="flex gap-3 select-none touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {renderMonth(0)}
        {renderMonth(1)}
      </div>

      <div className="mt-3 pt-3 border-t flex items-center gap-3 text-xs">
        <Legend color="bg-pink-600" label="선택" />
        <Legend color="bg-pink-100" label="범위" />
        <Legend color="bg-neutral-200" label="예약됨" />
      </div>

      {startDate && endDate && (
        <div className="mt-3 p-3 bg-pink-50 border border-pink-200 rounded text-sm space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <strong>{startDate}</strong> ~ <strong>{endDate}</strong>
              <span className="text-neutral-600"> · {days}일</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => jumpTo(startDate)}
                className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100"
              >
                ⇤ 시작일
              </button>
              <button
                type="button"
                onClick={() => jumpTo(endDate)}
                className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100"
              >
                종료일 ⇥
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-neutral-500 underline"
              >
                초기화
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <span className="text-[11px] text-neutral-500 mr-1">기간 조정:</span>
            <button type="button" onClick={() => shift(-30)} className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100">
              -1개월
            </button>
            <button type="button" onClick={() => shift(-7)} className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100">
              -1주
            </button>
            <button type="button" onClick={() => shift(7)} className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100">
              +1주
            </button>
            <button type="button" onClick={() => shift(30)} className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100">
              +1개월
            </button>
            <button type="button" onClick={() => shift(180)} className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100">
              +6개월
            </button>
            <button type="button" onClick={() => shift(365)} className="text-[11px] bg-white border rounded px-2 py-0.5 hover:bg-pink-100">
              +1년
            </button>
          </div>
        </div>
      )}

      {hint && (
        <div className="mt-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
          ⚠️ {hint}
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
