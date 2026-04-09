"use client";

import { useEffect, useRef, useState } from "react";

export default function SignaturePad({
  onSave,
  initialDataUrl,
}: {
  onSave: (dataUrl: string) => void | Promise<void>;
  initialDataUrl?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(!!initialDataUrl);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialDataUrl;
    }
  }, [initialDataUrl]);

  function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return {
        x: ((t.clientX - rect.left) / rect.width) * canvas.width,
        y: ((t.clientY - rect.top) / rect.height) * canvas.height,
      };
    }
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e);
  }
  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e);
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    setHasInk(true);
  }
  function end() {
    drawing.current = false;
    lastPos.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    await onSave(dataUrl);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={180}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        className="w-full border-2 border-dashed border-neutral-300 rounded bg-white touch-none cursor-crosshair"
      />
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clear}
          className="text-xs bg-neutral-200 px-3 py-1.5 rounded font-semibold"
        >
          다시 그리기
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasInk}
          className="text-xs bg-pink-600 text-white px-3 py-1.5 rounded font-semibold disabled:opacity-50"
        >
          서명 저장
        </button>
      </div>
    </div>
  );
}
