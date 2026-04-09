"use client";

import { useEffect, useRef, useState } from "react";

const LOCALES = [
  { code: "ko", native: "한국어" },
  { code: "en", native: "English" },
  { code: "zh", native: "中文" },
  { code: "ja", native: "日本語" },
  { code: "vi", native: "Tiếng Việt" },
  { code: "mn", native: "Монгол" },
  { code: "ru", native: "Русский" },
  { code: "id", native: "Bahasa" },
];

export default function LanguageSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function change(code: string) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: code }),
    });
    window.location.reload();
  }

  const cur = LOCALES.find((l) => l.code === current) || LOCALES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs px-2 py-1 rounded hover:bg-neutral-100 flex items-center gap-1"
      >
        🌐 {cur.native}
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-44 bg-white border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => change(l.code)}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 ${
                l.code === current ? "bg-pink-50 font-bold text-pink-700" : ""
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
