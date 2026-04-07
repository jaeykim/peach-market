"use client";

import { useState } from "react";

export default function DealContractForm({
  dealId,
  initial,
}: {
  dealId: string;
  initial: {
    closingDate?: string;
    downPayment?: number;
    midPayment?: number;
    finalPayment?: number;
    specialTerms?: string;
  };
}) {
  const [form, setForm] = useState({
    closingDate: initial.closingDate || "",
    downPayment: initial.downPayment?.toString() || "",
    midPayment: initial.midPayment?.toString() || "",
    finalPayment: initial.finalPayment?.toString() || "",
    specialTerms: initial.specialTerms || "",
  });
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractData: {
          closingDate: form.closingDate || undefined,
          downPayment: form.downPayment ? parseInt(form.downPayment, 10) : undefined,
          midPayment: form.midPayment ? parseInt(form.midPayment, 10) : undefined,
          finalPayment: form.finalPayment ? parseInt(form.finalPayment, 10) : undefined,
          specialTerms: form.specialTerms || undefined,
        },
      }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <form onSubmit={save} className="space-y-3 text-sm">
      <Field label="잔금일">
        <input
          type="date"
          className="input"
          value={form.closingDate}
          onChange={(e) => setForm({ ...form, closingDate: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="계약금 (원)">
          <input type="number" className="input" value={form.downPayment} onChange={(e) => setForm({ ...form, downPayment: e.target.value })} />
        </Field>
        <Field label="중도금 (원)">
          <input type="number" className="input" value={form.midPayment} onChange={(e) => setForm({ ...form, midPayment: e.target.value })} />
        </Field>
        <Field label="잔금 (원)">
          <input type="number" className="input" value={form.finalPayment} onChange={(e) => setForm({ ...form, finalPayment: e.target.value })} />
        </Field>
      </div>
      <Field label="특약 사항">
        <textarea
          className="input min-h-[100px]"
          value={form.specialTerms}
          onChange={(e) => setForm({ ...form, specialTerms: e.target.value })}
        />
      </Field>
      <button className="bg-pink-600 text-white px-4 py-2 rounded font-semibold">
        저장
      </button>
      {saved && <span className="ml-2 text-sm text-green-600">저장되었습니다.</span>}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          padding: 8px 12px;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
