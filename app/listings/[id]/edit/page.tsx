"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PhotoUploader from "@/components/PhotoUploader";

const PROPERTY_TYPES = [
  { value: "STUDIO", label: "원룸/투룸" },
  { value: "OFFICETEL", label: "오피스텔" },
  { value: "VILLA", label: "빌라/연립" },
  { value: "HOUSE", label: "단독주택" },
  { value: "MULTI_FAMILY", label: "다가구주택" },
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState("OPEN");

  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("STUDIO");
  const [askingPrice, setAskingPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [areaExclusive, setAreaExclusive] = useState("");
  const [floor, setFloor] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [builtYear, setBuiltYear] = useState("");
  const [rooms, setRooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isShortTerm, setIsShortTerm] = useState(false);
  const [rentalMonths, setRentalMonths] = useState("");

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          setError("매물을 찾을 수 없습니다.");
          return;
        }
        const j = await r.json();
        const l = j.listing;
        setTitle(l.title);
        setPropertyType(l.propertyType);
        setAskingPrice(String(l.askingPrice));
        setDeposit(l.deposit?.toString() ?? "");
        setAreaExclusive(l.areaExclusive?.toString() ?? "");
        setFloor(l.floor?.toString() ?? "");
        setTotalFloors(l.totalFloors?.toString() ?? "");
        setBuiltYear(l.builtYear?.toString() ?? "");
        setRooms(l.rooms?.toString() ?? "");
        setBathrooms(l.bathrooms?.toString() ?? "");
        setDescription(l.description ?? "");
        setStatus(l.status);
        setIsShortTerm(l.isShortTerm);
        setRentalMonths(l.rentalMonths?.toString() ?? "");
        try {
          setPhotos(JSON.parse(l.photos || "[]"));
        } catch {
          setPhotos([]);
        }
        setLoading(false);
      });
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const body = {
        title,
        propertyType,
        askingPrice: parseInt(askingPrice, 10),
        deposit: deposit ? parseInt(deposit, 10) : undefined,
        areaExclusive: areaExclusive ? parseFloat(areaExclusive) : undefined,
        floor: floor ? parseInt(floor, 10) : undefined,
        totalFloors: totalFloors ? parseInt(totalFloors, 10) : undefined,
        builtYear: builtYear ? parseInt(builtYear, 10) : undefined,
        rooms: rooms ? parseInt(rooms, 10) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
        description: description || undefined,
        photos: photos.length > 0 ? JSON.stringify(photos) : undefined,
        isShortTerm,
        rentalMonths: isShortTerm && rentalMonths ? parseInt(rentalMonths, 10) : null,
      };
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "저장 실패");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function togglePause() {
    const newStatus = status === "PAUSED" ? "OPEN" : "PAUSED";
    const res = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
  }

  async function remove() {
    if (!confirm("정말 이 매물을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/me");
    } else {
      const j = await res.json();
      alert(j.error || "삭제 실패");
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-neutral-500">불러오는 중...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">매물 수정</h1>
        <div className="flex gap-2">
          <button
            onClick={togglePause}
            className="text-xs bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded font-semibold"
          >
            {status === "PAUSED" ? "▶ 재개" : "⏸ 일시중지"}
          </button>
          <button
            onClick={remove}
            className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded font-semibold"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>

      {status === "PAUSED" && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
          ⏸ 이 매물은 일시중지 상태입니다. 지도와 검색 결과에서 표시되지 않습니다.
        </div>
      )}
      {status === "CLOSED" && (
        <div className="mb-4 bg-neutral-100 border border-neutral-200 rounded p-3 text-xs text-neutral-700">
          이 매물은 마감되었습니다.
        </div>
      )}

      <form onSubmit={save} className="space-y-4">
        <Field label="제목 *">
          <input
            className="input"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

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
          <Field label="월세 (만원)">
            <input
              className="input"
              required
              type="number"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="보증금 (만원)">
            <input
              className="input"
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
          </Field>
          <Field label="전용면적 (㎡)">
            <input
              className="input"
              type="number"
              step="0.01"
              value={areaExclusive}
              onChange={(e) => setAreaExclusive(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Field label="층">
            <input
              className="input"
              type="number"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </Field>
          <Field label="총 층">
            <input
              className="input"
              type="number"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
            />
          </Field>
          <Field label="방">
            <input
              className="input"
              type="number"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
            />
          </Field>
          <Field label="욕실">
            <input
              className="input"
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
          </Field>
        </div>

        <Field label="준공 연도">
          <input
            className="input"
            type="number"
            value={builtYear}
            onChange={(e) => setBuiltYear(e.target.value)}
          />
        </Field>

        <div className="border-t pt-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isShortTerm}
              onChange={(e) => setIsShortTerm(e.target.checked)}
            />
            ⏳ 단기임대
          </label>
          {isShortTerm && (
            <Field label="임대 기간 (개월)">
              <input
                className="input w-32"
                type="number"
                value={rentalMonths}
                onChange={(e) => setRentalMonths(e.target.value)}
              />
            </Field>
          )}
        </div>

        <Field label="설명">
          <textarea
            className="input min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="사진">
          <PhotoUploader urls={photos} onChange={setPhotos} />
        </Field>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {saved && <p className="text-green-600 text-sm">✓ 저장되었습니다.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장"}
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
      `}</style>
    </div>
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
