import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "피치마켓 - 투명한 부동산 P2P 거래",
  description: "중개인 없이 매도자와 매수자가 직접 협상하는 부동산 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-pink-600">
              🍑 피치마켓
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:text-pink-600">지도</Link>
              <Link href="/listings/new" className="hover:text-pink-600">매물 등록</Link>
              <Link href="/me" className="hover:text-pink-600">내 활동</Link>
              <Link href="/login" className="hover:text-pink-600">로그인</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
