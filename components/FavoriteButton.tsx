"use client";

import { useState } from "react";

export default function FavoriteButton({
  listingId,
  initial,
  loggedIn,
}: {
  listingId: string;
  initial: boolean;
  loggedIn: boolean;
}) {
  const [favorited, setFavorited] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    const next = !favorited;
    setFavorited(next);
    try {
      await fetch("/api/favorites", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
        favorited
          ? "bg-pink-600 text-white border-pink-600"
          : "bg-white text-neutral-600 border-neutral-300 hover:border-pink-400"
      }`}
      aria-label="찜"
    >
      {favorited ? "♥ 찜 됨" : "♡ 찜"}
    </button>
  );
}
