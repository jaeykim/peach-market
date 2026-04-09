"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Match = {
  id: string;
  side: string;
  title: string;
  address: string;
  askingPrice: number;
  areaExclusive: number | null;
};

export default function MatchRecommendations({ listingId }: { listingId: string }) {
  const [matches, setMatches] = useState<Match[] | null>(null);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/matches`)
      .then((r) => r.json())
      .then((j) => setMatches(j.matches || []));
  }, [listingId]);

  if (matches === null) return null;
  if (matches.length === 0) return null;

  return (
    <section className="border rounded-lg bg-white p-4">
      <h3 className="font-bold text-sm mb-2">🤝 매칭되는 반대 측 매물</h3>
      <p className="text-xs text-neutral-500 mb-3">
        같은 지역·종류·가격대의 반대편 사용자가 등록해둔 매물입니다.
      </p>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id} className="border rounded p-2 text-sm hover:bg-neutral-50">
            <Link href={`/listings/${m.id}`}>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    m.side === "SELL" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {m.side === "SELL" ? "매도" : "매수"}
                </span>
                <span className="font-semibold flex-1 truncate">{m.title}</span>
                <span className="text-xs font-bold">{m.askingPrice.toLocaleString()}만</span>
              </div>
              <div className="text-xs text-neutral-500">{m.address}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
