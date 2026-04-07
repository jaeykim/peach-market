import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const myListings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const myBids = await prisma.bid.findMany({
    where: { proposerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });

  const myDeals = await prisma.deal.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    orderBy: { createdAt: "desc" },
    include: { listing: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{user.name}님</h1>
        <p className="text-sm text-neutral-500">{user.email}</p>
      </div>

      <Section title={`내 매물 (${myListings.length})`}>
        {myListings.length === 0 ? (
          <Empty>아직 등록한 매물이 없습니다.</Empty>
        ) : (
          <ul className="divide-y">
            {myListings.map((l) => (
              <li key={l.id} className="py-2">
                <Link href={`/listings/${l.id}`} className="hover:text-pink-600">
                  <span className="text-xs font-bold mr-2">
                    [{l.side === "SELL" ? "매도" : "매수"}]
                  </span>
                  {l.title}
                  <span className="text-xs text-neutral-500 ml-2">({l.status})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`내가 보낸 제안 (${myBids.length})`}>
        {myBids.length === 0 ? (
          <Empty>아직 제안한 내역이 없습니다.</Empty>
        ) : (
          <ul className="divide-y">
            {myBids.map((b) => (
              <li key={b.id} className="py-2">
                <Link href={`/listings/${b.listing.id}`} className="hover:text-pink-600">
                  {b.listing.title} —{" "}
                  <span className="font-semibold">{b.amount.toLocaleString()}원</span>{" "}
                  <span className="text-xs text-neutral-500">({b.status})</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`성사된 딜 (${myDeals.length})`}>
        {myDeals.length === 0 ? (
          <Empty>아직 성사된 딜이 없습니다.</Empty>
        ) : (
          <ul className="divide-y">
            {myDeals.map((d) => (
              <li key={d.id} className="py-2">
                <Link href={`/deals/${d.id}`} className="hover:text-pink-600">
                  {d.listing.title} — {d.agreedPrice.toLocaleString()}원 ({d.status})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-bold mb-2">{title}</h2>
      <div className="border rounded-lg bg-white p-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-500">{children}</p>;
}
