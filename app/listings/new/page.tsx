"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    side: "SELL",
    title: "",
    address: "",
    addressDetail: "",
    lat: "37.5665",
    lng: "126.978",
    propertyType: "APT",
    dealType: "SALE",
    askingPrice: "",
    areaExclusive: "",
    floor: "",
    totalFloors: "",
    builtYear: "",
    rooms: "",
    bathrooms: "",
    description: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const body: Record<string, unknown> = {
      side: form.side,
      title: form.title,
      address: form.address,
      addressDetail: form.addressDetail || undefined,
      lat: parseFloat(form.lat),
      lng: parseFloat(form.lng),
      propertyType: form.propertyType,
      dealType: form.dealType,
      askingPrice: parseInt(form.askingPrice, 10),
      areaExclusive: form.areaExclusive ? parseFloat(form.areaExclusive) : undefined,
      floor: form.floor ? parseInt(form.floor, 10) : undefined,
      totalFloors: form.totalFloors ? parseInt(form.totalFloors, 10) : undefined,
      builtYear: form.builtYear ? parseInt(form.builtYear, 10) : undefined,
      rooms: form.rooms ? parseInt(form.rooms, 10) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
      description: form.description || undefined,
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
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">매물 등록</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-semibold">등록 유형</label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => update("side", "SELL")}
              className={`px-4 py-2 rounded border ${
                form.side === "SELL" ? "bg-pink-600 text-white" : "bg-white"
              }`}
            >
              매도 (집을 팝니다)
            </button>
            <button
              type="button"
              onClick={() => update("side", "BUY")}
              className={`px-4 py-2 rounded border ${
                form.side === "BUY" ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              매수 (집을 찾습니다)
            </button>
          </div>
        </div>

        <Field label="제목 *">
          <input className="input" required value={form.title} onChange={(e) => update("title", e.target.value)} />
        </Field>

        <Field label="주소 *">
          <input className="input" required placeholder="도로명 주소" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </Field>
        <Field label="상세 주소">
          <input className="input" value={form.addressDetail} onChange={(e) => update("addressDetail", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="위도 *">
            <input className="input" required value={form.lat} onChange={(e) => update("lat", e.target.value)} />
          </Field>
          <Field label="경도 *">
            <input className="input" required value={form.lng} onChange={(e) => update("lng", e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="매물 종류">
            <select className="input" value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
              <option value="APT">아파트</option>
              <option value="OFFICETEL">오피스텔</option>
              <option value="HOUSE">단독/다가구</option>
              <option value="VILLA">빌라</option>
            </select>
          </Field>
          <Field label="거래 유형">
            <select className="input" value={form.dealType} onChange={(e) => update("dealType", e.target.value)}>
              <option value="SALE">매매</option>
              <option value="JEONSE">전세</option>
              <option value="MONTHLY">월세</option>
            </select>
          </Field>
        </div>

        <Field label="희망 가격 (원) *">
          <input className="input" required type="number" value={form.askingPrice} onChange={(e) => update("askingPrice", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="전용면적 (㎡)">
            <input className="input" type="number" value={form.areaExclusive} onChange={(e) => update("areaExclusive", e.target.value)} />
          </Field>
          <Field label="준공 연도">
            <input className="input" type="number" value={form.builtYear} onChange={(e) => update("builtYear", e.target.value)} />
          </Field>
          <Field label="층">
            <input className="input" type="number" value={form.floor} onChange={(e) => update("floor", e.target.value)} />
          </Field>
          <Field label="총 층수">
            <input className="input" type="number" value={form.totalFloors} onChange={(e) => update("totalFloors", e.target.value)} />
          </Field>
          <Field label="방 개수">
            <input className="input" type="number" value={form.rooms} onChange={(e) => update("rooms", e.target.value)} />
          </Field>
          <Field label="욕실 개수">
            <input className="input" type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
          </Field>
        </div>

        <Field label="설명">
          <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => update("description", e.target.value)} />
        </Field>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-pink-600 text-white py-3 rounded font-semibold">
          등록하기
        </button>
      </form>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          padding: 8px 12px;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1">{label}</label>
      {children}
    </div>
  );
}
