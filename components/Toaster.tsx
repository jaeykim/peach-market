"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

declare global {
  interface Window {
    __peachToast?: (t: Omit<Toast, "id">) => void;
  }
}

export function showToast(type: Toast["type"], message: string) {
  if (typeof window !== "undefined" && window.__peachToast) {
    window.__peachToast({ type, message });
  }
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    window.__peachToast = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((arr) => [...arr, { ...t, id }]);
      setTimeout(() => {
        setToasts((arr) => arr.filter((x) => x.id !== id));
      }, 4000);
    };
    return () => {
      delete window.__peachToast;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {toasts.map((t) => {
        const cls =
          t.type === "success"
            ? "bg-green-600"
            : t.type === "error"
            ? "bg-red-600"
            : "bg-neutral-800";
        const icon = t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ";
        return (
          <div
            key={t.id}
            className={`${cls} text-white px-4 py-3 rounded shadow-lg text-sm flex items-start gap-2 animate-slideIn`}
          >
            <span className="font-bold">{icon}</span>
            <span className="flex-1">{t.message}</span>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        :global(.animate-slideIn) {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
