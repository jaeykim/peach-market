"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

// 클라이언트용 간이 사전 (HeaderNav 라벨)
const NAV_T: Record<string, Record<string, string>> = {
  ko: {
    find: "방 찾기",
    list: "방 올리기",
    me: "내 활동",
    login: "로그인",
    logout: "로그아웃",
    edit: "내 정보 수정",
  },
  en: {
    find: "Find a Room",
    list: "List a Room",
    me: "My Activity",
    login: "Log in",
    logout: "Log out",
    edit: "Edit Profile",
  },
  zh: {
    find: "找房",
    list: "发布房源",
    me: "我的",
    login: "登录",
    logout: "退出",
    edit: "修改资料",
  },
  ja: {
    find: "部屋を探す",
    list: "部屋を出す",
    me: "マイページ",
    login: "ログイン",
    logout: "ログアウト",
    edit: "プロフィール編集",
  },
  vi: {
    find: "Tìm phòng",
    list: "Đăng phòng",
    me: "Hoạt động",
    login: "Đăng nhập",
    logout: "Đăng xuất",
    edit: "Sửa hồ sơ",
  },
  mn: {
    find: "Өрөө хайх",
    list: "Өрөө байршуулах",
    me: "Миний",
    login: "Нэвтрэх",
    logout: "Гарах",
    edit: "Профайл засах",
  },
  ru: {
    find: "Найти",
    list: "Разместить",
    me: "Профиль",
    login: "Войти",
    logout: "Выйти",
    edit: "Редактировать",
  },
  id: {
    find: "Cari",
    list: "Pasang",
    me: "Profil",
    login: "Masuk",
    logout: "Keluar",
    edit: "Edit Profil",
  },
};

type Notif = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

type Me = { id: string; name: string; email: string; phone: string | null } | null;

export default function HeaderNav({ locale = "ko" }: { locale?: string }) {
  const t = NAV_T[locale] || NAV_T.ko;
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me>(null);
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  async function loadMe() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      setMe(j.user);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setUserMenuOpen(false);
    router.refresh();
    router.push("/");
  }

  async function load() {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    const j = await res.json();
    setNotifs(j.notifications || []);
    setUnread(j.unread || 0);
  }

  useEffect(() => {
    loadMe();
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    if (!open && unread > 0) {
      await fetch("/api/notifications", { method: "POST" });
      setUnread(0);
    }
    setOpen((v) => !v);
  }

  return (
    <nav className="flex items-center gap-4 text-sm">
      <Link href="/map" className="hover:text-pink-600">{t.find}</Link>
      <Link href="/listings/new" className="hover:text-pink-600">{t.list}</Link>
      {me && <Link href="/me" className="hover:text-pink-600">{t.me}</Link>}
      <LanguageSwitcher current={locale} />
      {!me ? (
        <Link href="/login" className="hover:text-pink-600">{t.login}</Link>
      ) : (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-neutral-100"
          >
            <span className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs">
              {me.name[0]}
            </span>
            <span className="text-xs font-semibold">{me.name}</span>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white border rounded-lg shadow-lg z-50">
              <div className="p-3 border-b">
                <div className="font-bold text-sm">{me.name}</div>
                <div className="text-xs text-neutral-500">{me.email}</div>
              </div>
              <Link
                href="/me"
                onClick={() => setUserMenuOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-neutral-50"
              >
                📋 내 활동
              </Link>
              <Link
                href="/me/edit"
                onClick={() => setUserMenuOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-neutral-50"
              >
                ⚙️ {t.edit}
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 border-t text-red-600"
              >
                🚪 {t.logout}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggle}
          className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="알림"
        >
          <span className="text-lg">🔔</span>
          {unread > 0 && (
            <span className="absolute top-0 right-0 bg-pink-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-10 w-80 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
            <div className="p-3 border-b">
              <h3 className="font-bold text-sm">알림</h3>
            </div>
            {notifs.length === 0 ? (
              <p className="p-4 text-xs text-neutral-500 text-center">알림 없음</p>
            ) : (
              <ul>
                {notifs.map((n) => (
                  <li key={n.id} className="border-b last:border-0 p-3 text-xs hover:bg-neutral-50">
                    <NotifItem n={n} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NotifItem({ n }: { n: Notif }) {
  const p = n.payload as Record<string, unknown>;
  const time = new Date(n.createdAt).toLocaleString("ko-KR");
  const title = (p.listingTitle as string) || "";

  if (n.type === "BID_RECEIVED") {
    return (
      <Link href={`/listings/${p.listingId}`}>
        <div className="font-semibold">💰 새 가격 제안</div>
        <div className="text-neutral-600">
          {title} · {(p.amount as number)?.toLocaleString()}만원
        </div>
        <div className="text-neutral-400 text-[10px]">{time}</div>
      </Link>
    );
  }
  if (n.type === "COUNTER_RECEIVED") {
    return (
      <Link href={`/listings/${p.listingId}`}>
        <div className="font-semibold">↩️ 카운터오퍼</div>
        <div className="text-neutral-600">
          {title} · {(p.amount as number)?.toLocaleString()}만원
        </div>
        <div className="text-neutral-400 text-[10px]">{time}</div>
      </Link>
    );
  }
  if (n.type === "BID_REJECTED") {
    return (
      <div>
        <div className="font-semibold">❌ 제안 거절</div>
        <div className="text-neutral-600">{title}</div>
        <div className="text-neutral-400 text-[10px]">{time}</div>
      </div>
    );
  }
  if (n.type === "DEAL_CLOSED" || n.type === "BID_ACCEPTED") {
    return (
      <Link href={`/deals/${p.dealId}`}>
        <div className="font-semibold text-green-700">🎉 딜 성사</div>
        <div className="text-neutral-600">
          {title} · {(p.agreedPrice as number)?.toLocaleString()}만원
        </div>
        <div className="text-neutral-400 text-[10px]">{time}</div>
      </Link>
    );
  }
  if (n.type === "CHAT_MESSAGE") {
    return (
      <Link href={`/deals/${p.dealId}`}>
        <div className="font-semibold">💬 새 메시지</div>
        <div className="text-neutral-600 truncate">{p.preview as string}</div>
        <div className="text-neutral-400 text-[10px]">{time}</div>
      </Link>
    );
  }
  return <div>{n.type}</div>;
}
