"use client";

import { useEffect, useState } from "react";

const TYPES = [
  {
    icon: "🗓️",
    title: "월세",
    desc: "가장 일반적인 월세 계약. 보증금과 월세, 기간을 직접 합의하세요.",
    tags: ["표준 계약", "보증금 에스크로", "카드 결제"],
  },
  {
    icon: "⏳",
    title: "단기임대",
    desc: "몇 달만 머물고 싶을 때. 방학·교환·인턴·워케이션 등.",
    tags: ["3~6개월", "유연한 기간", "전체 금액 카드"],
  },
  {
    icon: "↪️",
    title: "전대",
    desc: "남은 계약을 이어받을 사람을 찾을 때. 위약금 없이 자연스럽게.",
    tags: ["잔여 기간", "즉시 입주"],
  },
];

export default function RotatingTypeCards() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % TYPES.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-4 mt-10">
      {TYPES.map((t, i) => {
        const isActive = i === active;
        return (
          <button
            key={t.title}
            onClick={() => setActive(i)}
            className={`text-left border rounded-xl p-6 transition-all duration-500 ${
              isActive
                ? "border-pink-500 border-2 shadow-lg bg-white scale-[1.02]"
                : "border-neutral-200 bg-white opacity-60 hover:opacity-100"
            }`}
          >
            <div className="text-3xl mb-2">{t.icon}</div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              {t.title}
              {isActive && (
                <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-semibold">
                  무료
                </span>
              )}
            </h3>
            <p className="text-sm text-neutral-600 mt-2">{t.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-pink-100 text-pink-700" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
