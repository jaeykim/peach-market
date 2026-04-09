"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  side: string;
  isSublet: boolean;
  isShortTerm: boolean;
  rentalMonths: number | null;
  title: string;
  address: string;
  lat: number;
  lng: number;
  askingPrice: number;
  deposit: number | null;
  dealType: string;
  propertyType: string;
  areaExclusive: number | null;
  photos: string | null;
  negotiationCount: number;
};

// 매물 등록 유형 라벨 (dealType + side + isSublet 조합)
function sideLabel(dealType: string, side: string, isSublet: boolean): string {
  if (dealType === "SALE") return side === "SELL" ? "매도" : "매수";
  if (isSublet) return side === "SELL" ? "전대" : "전차";
  return side === "SELL" ? "임대" : "임차";
}

// Phase 1: 학생·대학가 월세 위주. 주거용만 노출.
const PROPERTY_TYPES = [
  { value: "STUDIO", label: "원룸/투룸" },
  { value: "OFFICETEL", label: "오피스텔" },
  { value: "VILLA", label: "빌라/연립" },
  { value: "HOUSE", label: "단독주택" },
  { value: "MULTI_FAMILY", label: "다가구주택" },
] as const;

const ALL_PROP_LABELS: Record<string, string> = {
  STUDIO: "원룸/투룸",
  OFFICETEL: "오피스텔",
  VILLA: "빌라/연립",
  HOUSE: "단독주택",
  MULTI_FAMILY: "다가구주택",
  APT: "아파트",
  SHOP: "상가",
  OFFICE: "사무실",
  KNOWLEDGE: "지식산업센터",
  BUILDING: "건물",
  FACTORY: "공장",
  WAREHOUSE: "창고",
  LODGING: "숙박시설",
  LAND: "토지",
};
function propTypeLabel(t: string): string {
  return ALL_PROP_LABELS[t] ?? t;
}

type Tab = "TRADE" | "RENT"; // TRADE=매매, RENT=월세/전세

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any;
  }
}

type SideFilter = "ALL" | "SELL" | "BUY";
type DealFilter = "ALL" | "SALE" | "JEONSE" | "MONTHLY";

// 주소에서 시/도 + 구 추출 (예: "서울특별시 강남구 테헤란로 152" → "강남구")
function extractRegion(address: string): string {
  const m = address.match(/([가-힣]+구|[가-힣]+군|[가-힣]+시)\s/);
  return m ? m[1] : "기타";
}

export default function MapView({
  clientId,
  listings,
}: {
  clientId: string;
  listings: Listing[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const itemRefs = useRef<Map<string, HTMLLIElement | null>>(new Map());

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tab, setTab] = useState<Tab>("RENT");
  const [sideFilter, setSideFilter] = useState<SideFilter>("ALL");
  const [dealFilter, setDealFilter] = useState<DealFilter>("ALL"); // 임대 탭에서만 사용 (전체/전세/월세)
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  // 매물 종류는 다중 선택 (Set으로 관리; 비어있으면 "전체")
  const [propTypes, setPropTypes] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState<string>(""); // 만원
  const [maxPrice, setMaxPrice] = useState<string>(""); // 만원
  const [minDeposit, setMinDeposit] = useState<string>("");
  const [maxDeposit, setMaxDeposit] = useState<string>("");
  const [sortBy, setSortBy] = useState<"NEW" | "PRICE_ASC" | "PRICE_DESC" | "AREA_DESC">("NEW");

  // AI 자연어 검색
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchMatches, setSearchMatches] = useState<
    { id: string; score: number; reason: string; matchedCriteria?: string[] }[] | null
  >(null);
  const [searchInterpretation, setSearchInterpretation] = useState("");
  const [searchCriteria, setSearchCriteria] = useState<string[]>([]);
  const [searchSource, setSearchSource] = useState<string>("");

  // 안정된 표시 ID (목록 순서 기반) + 지역 라벨
  const listingsWithSeq = useMemo(
    () =>
      listings.map((l, i) => ({
        ...l,
        seq: i + 1,
        region: extractRegion(l.address),
      })),
    [listings],
  );

  const regions = useMemo(() => {
    const set = new Set(listingsWithSeq.map((l) => l.region));
    return Array.from(set).sort();
  }, [listingsWithSeq]);

  const filtered = useMemo(() => {
    const minMan = minPrice ? parseInt(minPrice, 10) : -Infinity;
    const maxMan = maxPrice ? parseInt(maxPrice, 10) : Infinity;
    const minDep = minDeposit ? parseInt(minDeposit, 10) : -Infinity;
    const maxDep = maxDeposit ? parseInt(maxDeposit, 10) : Infinity;

    // AI 검색 결과가 있으면 그 ID 집합 + 점수만 통과
    const matchedIds = searchMatches
      ? new Set(searchMatches.map((m) => m.id))
      : null;

    const arr = listingsWithSeq.filter((l) => {
      if (matchedIds && !matchedIds.has(l.id)) return false;
      // 탭별 거래 유형 분리
      if (tab === "TRADE" && l.dealType !== "SALE") return false;
      if (tab === "RENT" && l.dealType === "SALE") return false;

      if (sideFilter !== "ALL" && l.side !== sideFilter) return false;
      if (tab === "RENT" && dealFilter !== "ALL" && l.dealType !== dealFilter) return false;
      if (propTypes.size > 0 && !propTypes.has(l.propertyType)) return false;
      if (regionFilter !== "ALL" && l.region !== regionFilter) return false;
      if (l.askingPrice < minMan || l.askingPrice > maxMan) return false;
      // 보증금 필터: 임대 탭에서만 의미. 월세 항목만 deposit 비교, 전세는 askingPrice가 곧 보증금이므로 그것으로 비교
      if (tab === "RENT" && (minDeposit || maxDeposit)) {
        const dep = l.dealType === "JEONSE" ? l.askingPrice : l.deposit ?? 0;
        if (dep < minDep || dep > maxDep) return false;
      }
      return true;
    });

    // AI 검색이 활성이면 점수순. 아니면 sortBy 적용.
    if (searchMatches) {
      const scoreById = new Map(searchMatches.map((m) => [m.id, m.score]));
      arr.sort((a, b) => (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0));
    } else if (sortBy === "PRICE_ASC") {
      arr.sort((a, b) => a.askingPrice - b.askingPrice);
    } else if (sortBy === "PRICE_DESC") {
      arr.sort((a, b) => b.askingPrice - a.askingPrice);
    } else if (sortBy === "AREA_DESC") {
      arr.sort((a, b) => (b.areaExclusive ?? 0) - (a.areaExclusive ?? 0));
    }
    // NEW는 이미 createdAt desc로 들어옴
    return arr;
  }, [listingsWithSeq, tab, sideFilter, dealFilter, propTypes, regionFilter, minPrice, maxPrice, minDeposit, maxDeposit, searchMatches, sortBy]);

  // SDK 로드
  useEffect(() => {
    if (!clientId) return;
    const existing = document.getElementById("naver-map-sdk");
    if (existing) {
      if (window.naver?.maps) setMapReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "naver-map-sdk";
    // submodules=geocoder: 주소 → 좌표 변환 (매물 등록 폼에서 사용)
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) setMapReady(true);
    };
    document.head.appendChild(script);
  }, [clientId]);

  // 지도 인스턴스 1회 생성
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || !window.naver?.maps) return;
    if (mapInstanceRef.current) return;
    const center =
      filtered.length > 0
        ? new window.naver.maps.LatLng(filtered[0].lat, filtered[0].lng)
        : new window.naver.maps.LatLng(37.5665, 126.978);
    mapInstanceRef.current = new window.naver.maps.Map(mapContainerRef.current, {
      center,
      zoom: 12,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // 마커 갱신 (필터 변경 시 재렌더). mapReady도 의존성에 넣어야 첫 진입 때 마커가 그려짐.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.naver?.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filtered.forEach((l) => {
      const color = l.side === "SELL" ? "#ec4899" : "#3b82f6";
      const isSel = l.id === selectedId;
      // 고정 크기 컨테이너로 anchor를 정확히 잡음
      // 컨테이너 폭 160px, 높이 40px, anchor는 (80, 40) = bottom-center
      const html = `
        <div style="width:160px;height:40px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:none;">
          <div style="background:${color};color:white;padding:3px 9px;border-radius:14px;font-size:11px;font-weight:bold;white-space:nowrap;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);pointer-events:auto;${
            isSel ? "outline:3px solid #fde68a;" : ""
          }">#${l.seq} ${sideLabel(l.dealType, l.side, l.isSublet)} ${
            l.dealType === "MONTHLY" && l.deposit != null
              ? `${formatPrice(l.deposit)}/${formatPrice(l.askingPrice)}`
              : formatPrice(l.askingPrice)
          }</div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};pointer-events:auto;"></div>
        </div>
      `;
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(l.lat, l.lng),
        map,
        title: l.title,
        icon: {
          content: html,
          size: new window.naver.maps.Size(160, 40),
          anchor: new window.naver.maps.Point(80, 40),
        },
        zIndex: isSel ? 1000 : 1,
      });
      window.naver.maps.Event.addListener(marker, "click", () => {
        setSelectedId(l.id);
        // 지도에서 마커 클릭 시: 줌 변경 없이 위치만 가운데로
        centerOnly(l);
      });
      markersRef.current.push(marker);
    });
  }, [filtered, selectedId, mapReady]);

  // 선택 변경 시 사이드바에서 해당 카드로 스크롤
  useEffect(() => {
    if (!selectedId) return;
    const el = itemRefs.current.get(selectedId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  // 줌 변경 없이 부드럽게 중심만 이동
  function centerOnly(l: Listing) {
    const map = mapInstanceRef.current;
    if (!map || !window.naver?.maps) return;
    map.panTo(new window.naver.maps.LatLng(l.lat, l.lng), {
      duration: 500,
      easing: "easeOutCubic",
    });
  }

  function selectAndPan(l: Listing) {
    setSelectedId(l.id);
    centerOnly(l);
  }

  async function runSearch(overrideQuery?: string) {
    const q = (overrideQuery ?? searchQuery).trim();
    if (!q) {
      setSearchMatches(null);
      return;
    }
    if (overrideQuery !== undefined) setSearchQuery(overrideQuery);
    setSearching(true);
    try {
      const res = await fetch("/api/listings/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const j = await res.json();
        setSearchMatches(j.matches || []);
        setSearchInterpretation(j.interpretation || "");
        setSearchCriteria(j.criteria || []);
        setSearchSource(j.source || "");
      }
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchMatches(null);
    setSearchInterpretation("");
    setSearchCriteria([]);
    setSearchSource("");
  }

  const matchInfoById = useMemo(() => {
    const m = new Map<
      string,
      { reason: string; score: number; matchedCriteria: string[] }
    >();
    if (searchMatches) {
      for (const x of searchMatches) {
        m.set(x.id, {
          reason: x.reason,
          score: x.score,
          matchedCriteria: x.matchedCriteria || [],
        });
      }
    }
    return m;
  }, [searchMatches]);

  return (
    <div className="space-y-3">
      <Tabs tab={tab} setTab={setTab} />
      <Filters
        tab={tab}
        sideFilter={sideFilter}
        setSideFilter={setSideFilter}
        dealFilter={dealFilter}
        setDealFilter={setDealFilter}
        propTypes={propTypes}
        setPropTypes={setPropTypes}
        regions={regions}
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        minDeposit={minDeposit}
        setMinDeposit={setMinDeposit}
        maxDeposit={maxDeposit}
        setMaxDeposit={setMaxDeposit}
        onReset={() => {
          setSideFilter("ALL");
          setDealFilter("ALL");
          setPropTypes(new Set());
          setRegionFilter("ALL");
          setMinPrice("");
          setMaxPrice("");
          setMinDeposit("");
          setMaxDeposit("");
        }}
      />
      <SearchBar
        query={searchQuery}
        setQuery={setSearchQuery}
        onSubmit={() => runSearch()}
        onPreset={(p) => runSearch(p)}
        onClear={clearSearch}
        searching={searching}
        active={searchMatches !== null}
        matchCount={searchMatches?.length ?? 0}
        source={searchSource}
        interpretation={searchInterpretation}
        criteria={searchCriteria}
        presets={getPresetsFor(propTypes)}
      />

      {!clientId ? (
        <div className="border rounded-lg p-8 bg-yellow-50 text-yellow-900 text-sm">
          <p className="font-semibold mb-2">⚠️ 네이버 지도 Client ID가 설정되지 않았습니다.</p>
          <ListingFallback listings={filtered} />
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_320px] gap-4">
          <div
            ref={mapContainerRef}
            className="w-full h-[600px] rounded-lg border bg-neutral-100"
          />
          <aside className="border rounded-lg bg-white p-3 h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-semibold">매물 {filtered.length}건</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-[11px] border rounded px-1 py-0.5 bg-white"
              >
                <option value="NEW">최신순</option>
                <option value="PRICE_ASC">가격 낮은순</option>
                <option value="PRICE_DESC">가격 높은순</option>
                <option value="AREA_DESC">면적 큰순</option>
              </select>
            </div>
            <ul className="space-y-2 text-sm">
              {filtered.map((l) => {
                const isSelected = l.id === selectedId;
                return (
                  <li
                    key={l.id}
                    ref={(el) => {
                      itemRefs.current.set(l.id, el);
                    }}
                    className={`border rounded p-2 cursor-pointer transition ${
                      isSelected
                        ? "border-pink-500 bg-pink-50 ring-2 ring-pink-300"
                        : "hover:bg-neutral-50"
                    }`}
                    onClick={() => selectAndPan(l)}
                  >
                    <div className="flex gap-2">
                      {firstPhoto(l.photos) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firstPhoto(l.photos)!}
                          alt=""
                          className="w-16 h-16 rounded object-cover shrink-0 bg-neutral-100"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-neutral-500">
                            #{String(l.seq).padStart(2, "0")}
                          </span>
                          <span className="font-semibold text-xs">
                            {l.dealType === "MONTHLY" && l.deposit != null
                              ? `${formatPrice(l.deposit)} / 월 ${formatPrice(l.askingPrice)}`
                              : formatPrice(l.askingPrice)}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          <Tag color={l.side === "SELL" ? "pink" : "blue"}>
                            {sideLabel(l.dealType, l.side, l.isSublet)}
                          </Tag>
                          <Tag color="neutral">{dealLabel(l.dealType)}</Tag>
                          {l.isShortTerm && (
                            <Tag color="orange">
                              ⏳ 단기{l.rentalMonths ? ` ${l.rentalMonths}개월` : ""}
                            </Tag>
                          )}
                          <Tag color="neutral">{propTypeLabel(l.propertyType)}</Tag>
                          {l.negotiationCount > 0 && (
                            <Tag color="orange">🤝 {l.negotiationCount}</Tag>
                          )}
                        </div>
                        <div className="text-neutral-700 mt-1 text-xs truncate">{l.title}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{l.address}</div>
                        {matchInfoById.get(l.id) && (
                          <div className="mt-1 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] bg-purple-600 text-white px-1.5 rounded font-bold">
                                {matchInfoById.get(l.id)!.score}점
                              </span>
                              <span className="text-[11px] text-purple-700 truncate">
                                ✨ {matchInfoById.get(l.id)!.reason}
                              </span>
                            </div>
                            {matchInfoById.get(l.id)!.matchedCriteria.length > 0 && (
                              <div className="flex flex-wrap gap-0.5">
                                {matchInfoById.get(l.id)!.matchedCriteria.map((c) => (
                                  <span
                                    key={c}
                                    className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-semibold"
                                  >
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Link
                        href={`/listings/${l.id}`}
                        className="mt-2 block text-center bg-pink-600 text-white py-1.5 rounded font-semibold text-xs"
                      >
                        상세보기 / 가격 제안 →
                      </Link>
                    )}
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="text-xs text-neutral-500 text-center py-8 list-none">
                  조건에 맞는 매물이 없습니다.
                </li>
              )}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}

const PRESET_BY_CATEGORY: Record<string, string[]> = {
  // 주거
  APT: ["좋은 학군지 아파트", "한강뷰 아파트", "재건축 가능성 높은 곳", "역세권 신축", "1군 단지"],
  OFFICETEL: ["역세권 신축 오피스텔", "한강뷰 오피스텔", "1인 가구 추천", "투자용 임대 수익률 좋은 곳"],
  VILLA: ["한강뷰 고급빌라", "재개발 가능성 빌라", "신축 빌라", "한남·평창동 고급"],
  HOUSE: ["전원주택", "마당 있는 단독", "리모델링 잘된 집"],
  STUDIO: ["역세권 풀옵션 원룸", "신촌·홍대·강남 원룸", "보증금 낮은 곳"],
  // 상업
  SHOP: ["1급지 상가 (A급)", "2급지 상가 (B급)", "3급지 상가 (C급)", "권리금 적은 신축 상가", "유동인구 많은 코너"],
  OFFICE: ["여의도·강남 핵심 사무실", "역세권 사무실", "스타트업 입주 사무실"],
  KNOWLEDGE: ["성수 지식산업센터", "문정·가산 핫스팟", "투자용 지산", "신축 지산"],
  // 투자/특수
  BUILDING: ["수익형 꼬마빌딩", "강남·성수 꼬마빌딩", "리노베이션 빌딩"],
  FACTORY: ["수도권 공장 매물", "전기 용량 큰 공장"],
  WAREHOUSE: ["수도권 물류 창고", "고천장 물류센터"],
  LAND: ["개발 가능 토지", "도로 접한 토지", "전원주택 부지"],
  LODGING: ["관광지 인근 숙박시설", "호스텔 매물"],
  MULTI_FAMILY: ["수익형 다가구", "역세권 다가구"],
};

const DEFAULT_PRESETS = [
  "한강뷰 고급빌라",
  "좋은 학군지 아파트",
  "재개발 가능성 높은 곳",
  "1급지 상가 (A급)",
  "역세권 신축 오피스텔",
  "수익형 꼬마빌딩",
];

function getPresetsFor(propTypes: Set<string>): string[] {
  if (propTypes.size === 0) return DEFAULT_PRESETS;
  const merged: string[] = [];
  const seen = new Set<string>();
  Array.from(propTypes).forEach((t) => {
    const presets = PRESET_BY_CATEGORY[t] || [];
    presets.forEach((p) => {
      if (!seen.has(p)) {
        seen.add(p);
        merged.push(p);
      }
    });
  });
  return merged.length > 0 ? merged.slice(0, 8) : DEFAULT_PRESETS;
}

function SearchBar({
  query,
  setQuery,
  onSubmit,
  onPreset,
  onClear,
  searching,
  active,
  matchCount,
  source,
  interpretation,
  criteria,
  presets,
}: {
  query: string;
  setQuery: (s: string) => void;
  onSubmit: () => void;
  onPreset: (p: string) => void;
  onClear: () => void;
  searching: boolean;
  active: boolean;
  matchCount: number;
  source: string;
  interpretation: string;
  criteria: string[];
  presets: string[];
}) {
  return (
    <div className="border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-purple-600 font-bold text-base">✨</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="느낌으로 검색해보세요 — 예: 한강뷰 고급빌라, 좋은 학군지, 재개발 가능성 높은 아파트"
          className="flex-1 border border-neutral-200 rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-purple-400 placeholder:text-neutral-400"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={searching || !query.trim()}
          className="bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-bold disabled:opacity-50"
        >
          {searching ? "분석 중..." : "AI 검색"}
        </button>
        {active && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-neutral-500 underline px-2"
          >
            초기화
          </button>
        )}
      </div>

      {!active && !searching && (
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-[11px] text-neutral-500 mr-1">추천:</span>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPreset(p)}
              className="text-[11px] bg-white border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full hover:bg-purple-100"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="mt-2 space-y-1.5">
          {interpretation && (
            <div className="text-xs bg-white border border-purple-200 rounded px-2 py-1.5">
              <span className="text-purple-700 font-semibold">🤖 AI 해석: </span>
              <span className="text-neutral-700">{interpretation}</span>
            </div>
          )}
          {criteria.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-[11px] text-neutral-500 mr-1">기준:</span>
              {criteria.map((c) => (
                <span
                  key={c}
                  className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-purple-700">
            🔎 매칭 <strong>{matchCount}건</strong>{" "}
            <span className="text-neutral-400">({source})</span>
          </p>
        </div>
      )}
    </div>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  // Phase 1: 월세/전세만 활성. 매매는 Phase 2 예정.
  return (
    <div className="flex border-b items-center gap-2">
      <button
        onClick={() => setTab("RENT")}
        className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
          tab === "RENT"
            ? "border-pink-600 text-pink-600"
            : "border-transparent text-neutral-500"
        }`}
      >
        🔑 월세 / 전세 / 단기 / 전대
      </button>
      <span className="text-xs text-neutral-400 ml-2">
        매매는 Phase 2 예정
      </span>
    </div>
  );
}

function Filters({
  tab,
  sideFilter,
  setSideFilter,
  dealFilter,
  setDealFilter,
  propTypes,
  setPropTypes,
  regions,
  regionFilter,
  setRegionFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minDeposit,
  setMinDeposit,
  maxDeposit,
  setMaxDeposit,
  onReset,
}: {
  tab: Tab;
  sideFilter: SideFilter;
  setSideFilter: (s: SideFilter) => void;
  dealFilter: DealFilter;
  setDealFilter: (s: DealFilter) => void;
  propTypes: Set<string>;
  setPropTypes: (s: Set<string>) => void;
  regions: string[];
  regionFilter: string;
  setRegionFilter: (s: string) => void;
  minPrice: string;
  setMinPrice: (s: string) => void;
  maxPrice: string;
  setMaxPrice: (s: string) => void;
  minDeposit: string;
  setMinDeposit: (s: string) => void;
  maxDeposit: string;
  setMaxDeposit: (s: string) => void;
  onReset: () => void;
}) {
  const priceLabel = tab === "TRADE" ? "매매가(만원)" : "월세/전세금(만원)";

  function togglePropType(v: string) {
    const next = new Set(propTypes);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setPropTypes(next);
  }

  return (
    <div className="border rounded-lg bg-white p-3 space-y-3">
      {/* 매물 종류: 다중 선택 뱃지 */}
      <div>
        <div className="text-xs font-bold text-neutral-700 mb-1.5">
          🏷️ 매물 종류
          {propTypes.size > 0 && (
            <span className="ml-2 text-pink-600">{propTypes.size}개 선택</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <ChipBtn
            active={propTypes.size === 0}
            onClick={() => setPropTypes(new Set())}
          >
            전체
          </ChipBtn>
          {PROPERTY_TYPES.map((p) => (
            <ChipBtn
              key={p.value}
              active={propTypes.has(p.value)}
              onClick={() => togglePropType(p.value)}
            >
              {p.label}
            </ChipBtn>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm pt-2 border-t">
        <FilterGroup label="등록">
          {(["ALL", "SELL", "BUY"] as const).map((v) => (
            <FilterBtn key={v} active={sideFilter === v} onClick={() => setSideFilter(v)}>
              {v === "ALL"
                ? "전체"
                : tab === "TRADE"
                ? v === "SELL" ? "매도" : "매수"
                : v === "SELL" ? "임대" : "임차"}
            </FilterBtn>
          ))}
        </FilterGroup>
        {tab === "RENT" && (
          <FilterGroup label="유형">
            {(["ALL", "JEONSE", "MONTHLY"] as const).map((v) => (
              <FilterBtn key={v} active={dealFilter === v} onClick={() => setDealFilter(v)}>
                {v === "ALL" ? "전체" : dealLabel(v)}
              </FilterBtn>
            ))}
          </FilterGroup>
        )}
        <FilterGroup label="지역">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="border rounded px-2 py-1 text-xs bg-white"
          >
            <option value="ALL">전체</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </FilterGroup>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <FilterGroup label={priceLabel}>
          <input
            type="number"
            placeholder="최소"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-24"
          />
          <span className="text-xs text-neutral-400">~</span>
          <input
            type="number"
            placeholder="최대"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-24"
          />
        </FilterGroup>
        {tab === "RENT" && (
          <FilterGroup label="보증금(만원)">
            <input
              type="number"
              placeholder="최소"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="border rounded px-2 py-1 text-xs w-24"
            />
            <span className="text-xs text-neutral-400">~</span>
            <input
              type="number"
              placeholder="최대"
              value={maxDeposit}
              onChange={(e) => setMaxDeposit(e.target.value)}
              className="border rounded px-2 py-1 text-xs w-24"
            />
          </FilterGroup>
        )}
        <button
          onClick={onReset}
          className="text-xs text-neutral-500 underline ml-auto"
        >
          초기화
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-neutral-500">{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
        active ? "bg-pink-600 text-white border-pink-600" : "bg-white text-neutral-600 border-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

function ChipBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
        active
          ? "bg-pink-100 text-pink-700 border-pink-500"
          : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({
  color,
  children,
}: {
  color: "pink" | "blue" | "neutral" | "orange";
  children: React.ReactNode;
}) {
  const cls =
    color === "pink"
      ? "bg-pink-100 text-pink-700"
      : color === "blue"
      ? "bg-blue-100 text-blue-700"
      : color === "orange"
      ? "bg-orange-100 text-orange-700"
      : "bg-neutral-100 text-neutral-700";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cls}`}>{children}</span>
  );
}

function ListingFallback({ listings }: { listings: (Listing & { seq?: number })[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {listings.map((l) => (
        <li key={l.id} className="border rounded p-2 bg-white">
          <span className="text-xs text-neutral-500 mr-1">#{String(l.seq ?? 0).padStart(2, "0")}</span>
          <Link href={`/listings/${l.id}`} className="font-semibold hover:underline">
            {l.title}
          </Link>
          <div className="text-xs text-neutral-600">{l.address}</div>
        </li>
      ))}
    </ul>
  );
}

function firstPhoto(photos: string | null): string | null {
  if (!photos) return null;
  try {
    const arr = JSON.parse(photos);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
}

function dealLabel(t: string) {
  return ({ SALE: "매매", JEONSE: "전세", MONTHLY: "월세", ALL: "전체" } as Record<string, string>)[t] || t;
}

// 입력 단위: 만원
function formatPrice(man: number): string {
  if (man >= 10_000) {
    const eok = Math.floor(man / 10_000);
    const rest = man % 10_000;
    return rest ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${man.toLocaleString()}만`;
}
