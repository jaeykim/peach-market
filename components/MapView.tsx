"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  side: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  askingPrice: number;
  dealType: string;
  propertyType: string;
  areaExclusive: number | null;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any;
  }
}

export default function MapView({
  clientId,
  listings,
}: {
  clientId: string;
  listings: Listing[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    const existing = document.getElementById("naver-map-sdk");
    if (existing) {
      if (window.naver) setMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "naver-map-sdk";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, [clientId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.naver) return;
    const center = listings.length
      ? new window.naver.maps.LatLng(listings[0].lat, listings[0].lng)
      : new window.naver.maps.LatLng(37.5665, 126.978); // 서울시청

    const map = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom: 13,
    });

    listings.forEach((l) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(l.lat, l.lng),
        map,
        title: l.title,
        icon: {
          content: `<div style="background:${
            l.side === "SELL" ? "#ec4899" : "#3b82f6"
          };color:white;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:bold;white-space:nowrap;">${
            l.side === "SELL" ? "매도" : "매수"
          } ${formatPrice(l.askingPrice)}</div>`,
          anchor: new window.naver.maps.Point(30, 12),
        },
      });
      window.naver.maps.Event.addListener(marker, "click", () => setSelected(l));
    });
  }, [mapReady, listings]);

  if (!clientId) {
    return (
      <div className="border rounded-lg p-8 bg-yellow-50 text-yellow-900 text-sm">
        <p className="font-semibold mb-2">⚠️ 네이버 지도 Client ID가 설정되지 않았습니다.</p>
        <p>
          .env 파일의 <code>NEXT_PUBLIC_NAVER_MAP_CLIENT_ID</code>를 설정해주세요.
        </p>
        <ListingFallback listings={listings} />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-4">
      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-lg border bg-neutral-100"
      />
      <aside className="border rounded-lg bg-white p-4 h-[600px] overflow-y-auto">
        <h3 className="font-semibold mb-2">매물 {listings.length}건</h3>
        {selected ? (
          <SelectedCard listing={selected} onClose={() => setSelected(null)} />
        ) : (
          <ul className="space-y-2 text-sm">
            {listings.map((l) => (
              <li
                key={l.id}
                className="border rounded p-2 cursor-pointer hover:bg-neutral-50"
                onClick={() => setSelected(l)}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-bold ${
                      l.side === "SELL" ? "text-pink-600" : "text-blue-600"
                    }`}
                  >
                    {l.side === "SELL" ? "매도" : "매수"}
                  </span>
                  <span className="font-semibold">{formatPrice(l.askingPrice)}</span>
                </div>
                <div className="text-neutral-700">{l.title}</div>
                <div className="text-xs text-neutral-500">{l.address}</div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

function SelectedCard({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  return (
    <div className="text-sm">
      <button onClick={onClose} className="text-xs text-neutral-500 mb-2">
        ← 목록으로
      </button>
      <div
        className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-2 ${
          listing.side === "SELL" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
        }`}
      >
        {listing.side === "SELL" ? "매도 매물" : "매수 희망"}
      </div>
      <h4 className="font-bold text-base">{listing.title}</h4>
      <p className="text-neutral-600">{listing.address}</p>
      <p className="mt-2">
        희망가 <span className="font-bold">{formatPrice(listing.askingPrice)}</span>
      </p>
      {listing.areaExclusive && <p>전용 {listing.areaExclusive}㎡</p>}
      <Link
        href={`/listings/${listing.id}`}
        className="mt-3 inline-block w-full text-center bg-pink-600 text-white py-2 rounded font-semibold"
      >
        상세보기 / 가격 제안
      </Link>
    </div>
  );
}

function ListingFallback({ listings }: { listings: Listing[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {listings.map((l) => (
        <li key={l.id} className="border rounded p-2 bg-white">
          <Link href={`/listings/${l.id}`} className="font-semibold hover:underline">
            {l.title}
          </Link>
          <div className="text-xs text-neutral-600">{l.address}</div>
        </li>
      ))}
    </ul>
  );
}

function formatPrice(won: number): string {
  if (won >= 100_000_000) {
    const eok = won / 100_000_000;
    return `${eok.toFixed(eok >= 10 ? 0 : 1)}억`;
  }
  if (won >= 10_000) return `${Math.round(won / 10_000).toLocaleString()}만`;
  return `${won.toLocaleString()}원`;
}
