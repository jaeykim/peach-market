import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "피치마켓 - 수수료 없는 월세 · 단기 · 전대",
  description:
    "동네에서 만나는 수수료 0원 월세. 매물 검증·표준 계약서·전자서명·에스크로까지 무료로 지원합니다.",
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
            <HeaderNav />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
