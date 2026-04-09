"use client";

import { useRef, useState } from "react";

export default function PhotoUploader({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "업로드 실패");
        return;
      }
      const j = await res.json();
      onChange([...urls, ...j.urls]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    const next = urls.slice();
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {urls.map((u, i) => (
          <div key={i} className="relative aspect-square group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={u}
              alt=""
              className="w-full h-full object-cover rounded border bg-neutral-100"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs"
              aria-label="삭제"
            >
              ✕
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-pink-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                대표
              </span>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square border-2 border-dashed border-pink-300 rounded text-pink-600 text-xs font-semibold hover:bg-pink-50 disabled:opacity-50"
        >
          {uploading ? "업로드 중..." : "+ 사진 추가"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <p className="text-[11px] text-neutral-500 mt-1">
        최대 10MB · JPG/PNG/WebP/GIF · 첫 번째 사진이 대표 이미지로 사용됩니다.
      </p>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
