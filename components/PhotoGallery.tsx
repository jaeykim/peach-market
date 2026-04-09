"use client";

import { useState, useEffect } from "react";

export default function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (openIdx === null) return;
      if (e.key === "Escape") setOpenIdx(null);
      if (e.key === "ArrowRight") setOpenIdx((i) => (i! + 1) % photos.length);
      if (e.key === "ArrowLeft")
        setOpenIdx((i) => (i! - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, photos.length]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={url}
            alt={`${alt} ${i + 1}`}
            onClick={() => setOpenIdx(i)}
            className="w-full h-40 object-cover rounded-lg border bg-neutral-100 cursor-zoom-in hover:opacity-90"
          />
        ))}
      </div>

      {openIdx !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setOpenIdx(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx(null);
            }}
            className="absolute top-4 right-4 text-white text-2xl"
            aria-label="닫기"
          >
            ✕
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((i) => (i! - 1 + photos.length) % photos.length);
            }}
            className="absolute left-4 text-white text-3xl"
            aria-label="이전"
          >
            ‹
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[openIdx]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((i) => (i! + 1) % photos.length);
            }}
            className="absolute right-4 text-white text-3xl"
            aria-label="다음"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
            {openIdx + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
