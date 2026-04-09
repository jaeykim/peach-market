"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditMePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [residentNumber, setResidentNumber] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifApp, setNotifApp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      const j = await r.json();
      if (!j.user) {
        router.push("/login");
        return;
      }
      setName(j.user.name);
      setPhone(j.user.phone || "");
      setResidentNumber(j.user.residentNumber || "");
      setAddress(j.user.address || "");
      setNotifEmail(j.user.notifEmailEnabled ?? true);
      setNotifPush(j.user.notifPushEnabled ?? true);
      setNotifApp(j.user.notifAppEnabled ?? true);
      setLoading(false);
    });
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const body: Record<string, unknown> = {
        name,
        phone,
        residentNumber,
        address,
        notifEmailEnabled: notifEmail,
        notifPushEnabled: notifPush,
        notifAppEnabled: notifApp,
      };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "저장 실패");
        return;
      }
      setMsg("저장되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-sm text-neutral-500">불러오는 중...</div>;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">⚙️ 내 정보 수정</h1>
      <form onSubmit={save} className="space-y-4">
        <Field label="이름">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label="연락처">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="010-0000-0000"
          />
        </Field>
        <Field label="주민등록번호 (계약서 자동 채움용)">
          <input
            type="text"
            value={residentNumber}
            onChange={(e) => setResidentNumber(e.target.value)}
            className="input"
            placeholder="000000-0000000"
          />
          <p className="text-[11px] text-neutral-500 mt-0.5">
            ⚠️ 데모용 평문 저장. 실서비스에서는 암호화 + KMS 보호 필수.
          </p>
        </Field>
        <Field label="주소 (주민등록상)">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input"
            placeholder="서울특별시 ..."
          />
        </Field>

        <div className="border-t pt-4">
          <h2 className="text-sm font-bold text-neutral-700 mb-2">비밀번호 변경 (선택)</h2>
          <Field label="현재 비밀번호">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="새 비밀번호 (6자 이상)">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-sm font-bold text-neutral-700 mb-2">🔔 알림 설정</h2>
          <div className="space-y-2 text-sm">
            <label className="flex items-center justify-between cursor-pointer">
              <span>인앱 알림 (헤더 종)</span>
              <input
                type="checkbox"
                checked={notifApp}
                onChange={(e) => setNotifApp(e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>이메일 알림</span>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>모바일 푸시 알림</span>
              <input
                type="checkbox"
                checked={notifPush}
                onChange={(e) => setNotifPush(e.target.checked)}
                className="w-4 h-4"
              />
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-green-600">{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-pink-600 text-white font-bold py-3 rounded disabled:opacity-50"
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
