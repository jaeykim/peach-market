"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AddressPicker, { SelectedAddress } from "@/components/AddressPicker";
import PhotoUploader from "@/components/PhotoUploader";

// Phase 1: 대학가 주거용만
const PROPERTY_TYPES = [
  { value: "STUDIO", label: "원룸/투룸" },
  { value: "OFFICETEL", label: "오피스텔" },
  { value: "VILLA", label: "빌라/연립" },
  { value: "HOUSE", label: "단독주택" },
  { value: "MULTI_FAMILY", label: "다가구주택" },
];

export default function NewListingPage({
  // 서버에서 환경변수를 직접 못 쓰므로 NEXT_PUBLIC_ 접두사 사용
}: Record<string, never>) {
  const naverClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "";
  const router = useRouter();

  const [side, setSide] = useState<"SELL" | "BUY">("SELL");
  const [isSublet, setIsSublet] = useState(false);
  const [isShortTerm, setIsShortTerm] = useState(false);
  const [shortTermMinMonths, setShortTermMinMonths] = useState("3");
  const [address, setAddress] = useState<SelectedAddress | null>(null);
  const [addressDetail, setAddressDetail] = useState("");
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("STUDIO");
  const [dealType, setDealType] = useState<"SALE" | "JEONSE" | "MONTHLY">("MONTHLY");
  const [askingPrice, setAskingPrice] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [deposit, setDeposit] = useState("");
  const [areaExclusive, setAreaExclusive] = useState(""); // 항상 ㎡ 단위로 저장
  const [areaUnit, setAreaUnit] = useState<"M2" | "PY">("M2");
  const [floor, setFloor] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [builtYear, setBuiltYear] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Phase 1: AI 적정가 기능 제거 (고정가 거래). Phase 2에서 다시 활성.

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!address) {
      setError("주소를 선택해주세요.");
      return;
    }
    if (!askingPrice) {
      setError("희망 가격을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        side,
        isSublet,
        isShortTerm,
        shortTermMinMonths: isShortTerm ? parseInt(shortTermMinMonths, 10) || 3 : undefined,
        title,
        address: address.address,
        addressDetail: addressDetail || undefined,
        lat: address.lat,
        lng: address.lng,
        propertyType,
        dealType,
        askingPrice: parseInt(askingPrice, 10),
        priceMin: side === "BUY" && priceMin ? parseInt(priceMin, 10) : undefined,
        priceMax: side === "BUY" && priceMax ? parseInt(priceMax, 10) : undefined,
        deposit: deposit ? parseInt(deposit, 10) : undefined,
        areaExclusive: areaExclusive ? parseFloat(areaExclusive) : undefined,
        floor: floor ? parseInt(floor, 10) : undefined,
        totalFloors: totalFloors ? parseInt(totalFloors, 10) : undefined,
        builtYear: builtYear ? parseInt(builtYear, 10) : undefined,
        rooms: rooms ? parseInt(rooms, 10) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
        description: description || undefined,
        photos: photos.length > 0 ? JSON.stringify(photos) : undefined,
      };
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(typeof j.error === "string" ? j.error : "등록 실패 (로그인 필요)");
        return;
      }
      const j = await res.json();
      router.push(`/listings/${j.listing.id}`);
    } finally {
      setSubmitting(false);
    }
  }

  const priceLabel =
    dealType === "MONTHLY" ? "월세" : dealType === "JEONSE" ? "전세금" : "매매가";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">매물 등록</h1>
      <p className="text-sm text-neutral-500 mb-6">
        투명하게 정보를 공개하면 더 빠르게 거래가 성사됩니다.
      </p>

      <form onSubmit={submit} className="space-y-6">
        {/* 1. 등록 유형 */}
        <Section title="① 등록 유형" subtitle="방을 어떻게 내놓으시나요?">
          <div className="grid grid-cols-2 gap-3">
            <BigOption
              active={side === "SELL" && !isSublet}
              activeColor="pink"
              onClick={() => {
                setSide("SELL");
                setIsSublet(false);
              }}
              label="🏠 임대"
              desc="내 방을 빌려줍니다"
            />
            <BigOption
              active={side === "SELL" && isSublet}
              activeColor="pink"
              onClick={() => {
                setSide("SELL");
                setIsSublet(true);
              }}
              label="↪️ 전대"
              desc="임차 중인 집을 다시 빌려줍니다"
            />
          </div>
        </Section>

        {/* 2. 위치 */}
        <Section title="② 위치" subtitle="주소를 검색해서 선택해주세요">
          <AddressPicker
            value={address}
            onChange={setAddress}
            naverClientId={naverClientId}
          />
          {address && (
            <input
              type="text"
              placeholder="상세 주소 (동/호수 등, 선택)"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              className="input mt-2"
            />
          )}
        </Section>

        {/* 3. 종류 + 거래 유형 */}
        <Section title="③ 매물 종류 / 거래 유형">
          <div className="grid grid-cols-2 gap-3">
            <Field label="매물 종류">
              <select
                className="input"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                {PROPERTY_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="거래 유형">
              <div className="grid grid-cols-2 gap-1">
                {(["MONTHLY", "JEONSE"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDealType(v)}
                    className={`py-2 rounded text-sm font-semibold border ${
                      dealType === v
                        ? "bg-pink-600 text-white border-pink-600"
                        : "bg-white"
                    }`}
                  >
                    {v === "JEONSE" ? "전세" : "월세"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-3 border-t pt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isShortTerm}
                onChange={(e) => setIsShortTerm(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">⏳ 단기임대</span>
              <span className="text-xs text-neutral-500">
                방학·교환학생·인턴십 등 단기 목적
              </span>
            </label>
            {isShortTerm && (
              <div className="mt-2 ml-6">
                <Field label="단기임대 최소 기간 (개월)">
                  <input
                    type="number"
                    className="input w-32"
                    placeholder="3"
                    value={shortTermMinMonths}
                    onChange={(e) => setShortTermMinMonths(e.target.value)}
                    min={1}
                    max={11}
                  />
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    임차인은 이 기간 이상만 단기임대 신청 가능. 이 매물은 월세(1년+)와 단기임대를 모두 받습니다.
                  </p>
                </Field>
              </div>
            )}
          </div>
        </Section>

        {/* 4. 제목 + 면적 + 층 등 */}
        <Section title="④ 기본 정보">
          <Field label="제목 *">
            <input
              className="input"
              required
              placeholder="예) 강남 래미안 84㎡ 남향 고층"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <Field label="전용면적">
              <AreaInput
                m2={areaExclusive}
                setM2={setAreaExclusive}
                unit={areaUnit}
                setUnit={setAreaUnit}
              />
            </Field>
            <Field label="준공 연도">
              <input className="input" type="number" placeholder="예) 2018" value={builtYear} onChange={(e) => setBuiltYear(e.target.value)} />
            </Field>
            <Field label="층 / 총 층수">
              <div className="flex gap-1 items-center">
                <input className="input" type="number" placeholder="층" value={floor} onChange={(e) => setFloor(e.target.value)} />
                <span className="text-neutral-400">/</span>
                <input className="input" type="number" placeholder="총" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} />
              </div>
            </Field>
            <Field label="방 / 욕실">
              <div className="flex gap-1 items-center">
                <input className="input" type="number" placeholder="방" value={rooms} onChange={(e) => setRooms(e.target.value)} />
                <span className="text-neutral-400">/</span>
                <input className="input" type="number" placeholder="욕실" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
              </div>
            </Field>
          </div>
        </Section>

        {/* 5. 가격 + AI 추천 */}
        <Section title="⑤ 희망 가격" subtitle="적정가를 모르겠다면 AI 추천을 받아보세요">
          <div className="space-y-2">
            <Field label={`${priceLabel} (만원) *`}>
              <input
                className="input"
                required
                type="number"
                placeholder="예) 55 (= 월 55만원)"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
              />
              <p className="text-[11px] text-neutral-500 mt-0.5">
                이 금액으로 신청이 접수되고 계약이 진행됩니다.
              </p>
            </Field>

            {side === "BUY" && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="text-xs font-bold text-blue-900 mb-2">
                  📊 가격 범위 (선택, 매수자 전용)
                </div>
                <p className="text-[11px] text-blue-700 mb-2">
                  희망가 외에 수용 가능한 가격대를 알려주면 매도자가 더 정확하게 매칭됩니다.
                  <br />둘 다 비우면 위 희망가만 사용. 한쪽만 입력하면 &lsquo;이상&rsquo; 또는 &lsquo;이하&rsquo;.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="최소 (이상)">
                    <input
                      className="input"
                      type="number"
                      placeholder="예) 22000"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                  </Field>
                  <Field label="최대 (이하)">
                    <input
                      className="input"
                      type="number"
                      placeholder="예) 25000"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            )}

            {dealType === "MONTHLY" && (
              <Field label="보증금 (만원)">
                <input
                  className="input"
                  type="number"
                  placeholder="예) 10000 (= 1억)"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </Field>
            )}
          </div>
        </Section>

        {/* 6. 사진 */}
        <Section title="⑥ 사진" subtitle="여러 장 업로드 가능 (드래그도 가능)">
          <PhotoUploader urls={photos} onChange={setPhotos} />
        </Section>

        {/* 7. 설명 */}
        <Section title="⑦ 설명" subtitle="역세권/학군/특이사항 등을 자유롭게 적어주세요">
          <textarea
            className="input min-h-[120px]"
            placeholder="예) 역세권 신축, 즉시 입주 가능. 풀옵션 빌트인."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Section>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-pink-600 text-white py-3.5 rounded-lg font-bold text-base disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "매물 등록하기"}
        </button>
      </form>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid #d4d4d4;
          border-radius: 8px;
          padding: 9px 12px;
          background: white;
          font-size: 14px;
        }
        :global(.input:focus) {
          outline: 2px solid #f9a8d4;
          border-color: #ec4899;
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border rounded-lg bg-white p-4">
      <h2 className="font-bold text-base">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-500 mt-0.5 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-neutral-600 block mb-1">{label}</label>
      {children}
    </div>
  );
}

// 1평 ≈ 3.3058㎡
const M2_PER_PY = 3.3058;

function AreaInput({
  m2,
  setM2,
  unit,
  setUnit,
}: {
  m2: string; // 항상 ㎡로 저장 (부모 state)
  setM2: (v: string) => void;
  unit: "M2" | "PY";
  setUnit: (u: "M2" | "PY") => void;
}) {
  // 사용자가 현재 단위로 직접 타이핑한 raw 텍스트.
  // 부모 m2가 외부에서 바뀌었을 때만 동기화 (예: 단위 토글).
  const [raw, setRaw] = useState<string>(() =>
    m2 === "" ? "" : unit === "M2" ? m2 : (parseFloat(m2) / M2_PER_PY).toFixed(2),
  );
  const lastUnitRef = useRef(unit);
  const lastM2Ref = useRef(m2);

  useEffect(() => {
    // 단위가 바뀌면 raw를 재계산
    if (lastUnitRef.current !== unit) {
      lastUnitRef.current = unit;
      if (m2 === "") {
        setRaw("");
      } else if (unit === "M2") {
        setRaw(m2);
      } else {
        setRaw((parseFloat(m2) / M2_PER_PY).toFixed(2));
      }
      lastM2Ref.current = m2;
      return;
    }
    // 외부에서 m2가 바뀐 경우 (예: 초기화)
    if (lastM2Ref.current !== m2 && m2 === "") {
      setRaw("");
      lastM2Ref.current = m2;
    }
  }, [m2, unit]);

  function onInput(v: string) {
    setRaw(v); // 입력은 그대로 보존 (소수점/지우기 등)
    if (v === "") {
      setM2("");
      lastM2Ref.current = "";
      return;
    }
    const num = parseFloat(v);
    if (Number.isNaN(num)) return;
    const next = unit === "M2" ? String(num) : (num * M2_PER_PY).toFixed(4);
    setM2(next);
    lastM2Ref.current = next;
  }

  const conv =
    m2 === "" || raw === ""
      ? ""
      : unit === "M2"
      ? `≈ ${(parseFloat(m2) / M2_PER_PY).toFixed(1)}평`
      : `≈ ${parseFloat(m2).toFixed(1)}㎡`;

  return (
    <div>
      <div className="flex gap-1">
        <input
          type="text"
          inputMode="decimal"
          className="input flex-1"
          value={raw}
          onChange={(e) => onInput(e.target.value)}
        />
        <div className="flex rounded border overflow-hidden shrink-0">
          {(["M2", "PY"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-2 text-xs font-semibold ${
                unit === u ? "bg-pink-600 text-white" : "bg-white text-neutral-600"
              }`}
            >
              {u === "M2" ? "㎡" : "평"}
            </button>
          ))}
        </div>
      </div>
      {conv && <p className="text-[10px] text-neutral-500 mt-0.5">{conv}</p>}
    </div>
  );
}

function BigOption({
  active,
  activeColor,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  activeColor: "pink" | "blue";
  onClick: () => void;
  label: string;
  desc: string;
}) {
  const activeCls =
    activeColor === "pink"
      ? "border-pink-500 bg-pink-50 text-pink-700"
      : "border-blue-500 bg-blue-50 text-blue-700";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-center transition ${
        active ? activeCls : "border-neutral-200 bg-white"
      }`}
    >
      <div className="text-lg font-bold">{label}</div>
      <div className="text-xs text-neutral-500 mt-1">{desc}</div>
    </button>
  );
}
