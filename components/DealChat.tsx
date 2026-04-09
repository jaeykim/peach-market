"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  text: string;
  createdAt: string;
  sender: { id: string; name: string };
};

export default function DealChat({
  dealId,
  currentUserId,
}: {
  dealId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/deals/${dealId}/chat`, { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      setMessages(j.messages);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setText("");
        load();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="border rounded-lg bg-white p-4">
      <h2 className="font-bold mb-3">💬 1:1 채팅</h2>
      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto border rounded p-3 space-y-2 bg-neutral-50 mb-3"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-neutral-500 text-center mt-12">
            아직 메시지가 없습니다. 잔금일·인테리어·짐 정리 등 디테일을 협의하세요.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender.id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    mine
                      ? "bg-pink-600 text-white"
                      : "bg-white border text-neutral-800"
                  }`}
                >
                  {!mine && (
                    <div className="text-[10px] font-semibold text-neutral-500 mb-0.5">
                      {m.sender.name}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[10px] mt-1 ${
                      mine ? "text-pink-100" : "text-neutral-400"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-pink-600 text-white font-bold px-4 rounded text-sm disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </section>
  );
}
