import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";

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
            <HeaderNav />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
