"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"idle" | "verifying" | "done">("idle");

  async function verify() {
    setBusy(true);
    setStep("verifying");
    // Mock 인증 진행 시뮬레이션
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch("/api/me/verify", { method: "POST" });
    if (res.ok) {
      setStep("done");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <button
      onClick={verify}
      disabled={busy}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-sm disabled:opacity-50"
    >
      {step === "verifying" ? "🔐 PASS 인증 중..." : "🛡️ 본인 인증하기"}
    </button>
  );
}
