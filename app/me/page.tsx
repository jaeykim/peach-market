import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import VerifyButton from "@/components/VerifyButton";
import VerifyOwnershipButton from "@/components/VerifyOwnershipButton";
import { sideLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [myListings, myBids, myDeals, favorites, recentViews] = await Promise.all([
    prisma.listing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bid.findMany({
      where: { proposerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { listing: true },
    }),
    prisma.deal.findMany({
      where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      orderBy: { createdAt: "desc" },
      include: { listing: true },
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { listing: true },
    }),
    prisma.recentView.findMany({
      where: { userId: user.id },
      orderBy: { viewedAt: "desc" },
      take: 10,
      include: { listing: true },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {user.name}님 {user.verifiedAt && <span className="text-green-600">✅</span>}
          </h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
          {user.verifiedAt && (
            <p className="text-xs text-green-600 mt-1">
              본인 인증 완료 ({new Date(user.verifiedAt).toLocaleDateString("ko-KR")})
            </p>
          )}
        </div>
        {!user.verifiedAt && <VerifyButton />}
      </div>

      <Section title={`내 매물 (${myListings.length})`}>
        {myListings.length === 0 ? (
          <Empty>아직 등록한 매물이 없습니다.</Empty>
        ) : (
          <ul className="divide-y">
            {myListings.map((l) => (
              <li key={l.id} className="py-2">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/listings/${l.id}`} className="hover:text-pink-600 flex-1 min-w-0">
                    <span className="text-xs font-bold mr-2">
                      [{sideLabel(l.dealType, l.side, l.isSublet)}]
                    </span>
                    {l.title}
                    <span className="text-xs text-neutral-500 ml-2">
                      ({l.status} · 조회 {l.viewCount}회)
                    </span>
                  </Link>
                  <VerifyOwnershipButton
                    listingId={l.id}
                    initialVerified={!!l.ownershipVerifiedAt}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`찜한 매물 (${favorites.length})`}>
        {favorites.length === 0 ? (
          <Empty>찜한 매물이 없습니다.</Empty>
        ) : (
          <ul className="divide-y">
            {favorites.map((f) => (
              <li key={f.id} className="py-2">
                <Link href={`/listings/${f.listingId}`} className="hover:text-pink-600">
                  ♥ {f.listing.title}
                  <span className="text-xs text-neutral-500 ml-2">
                    {f.listing.address}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`최근 본 매물 (${recentViews.length})`}>
        {recentViews.length === 0 ? (
          <Empty>최근 본 매물이 없습니다.</Empty>
        ) : (
          <ul className="divide-y">
            {recentViews.map((rv) => (
              <li key={rv.id} className="py-2">
                <Link href={`/listings/${rv.listingId}`} className="hover:text-pink-600">
                  {rv.listing.title}
                  <span className="text-xs text-neutral-500 ml-2">
                    {new Date(rv.viewedAt).toLocaleString("ko-KR")}
                  </span>
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
                  <span className="font-semibold">{b.amount.toLocaleString()}만원</span>{" "}
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
                  {d.listing.title} — {d.agreedPrice.toLocaleString()}만원 ({d.status})
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
