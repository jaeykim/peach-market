import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import HeaderNav from "@/components/HeaderNav";
import Toaster from "@/components/Toaster";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Peach Market - Zero-fee rentals",
  description:
    "Find a room in your neighborhood with no broker fees. Free contracts, escrow, and identity verification.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="antialiased bg-neutral-50 text-neutral-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-pink-600">
              🍑 피치마켓
            </Link>
            <HeaderNav locale={locale} />
          </div>
        </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
