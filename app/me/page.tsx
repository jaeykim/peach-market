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

  const [myListings, myDeals, favorites, recentViews] = await Promise.all([
    prisma.listing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
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
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <Link href={`/listings/${l.id}`} className="hover:text-pink-600 flex-1 min-w-0">
                    <span className="text-xs font-bold mr-2">
                      [{sideLabel(l.dealType, l.side, l.isSublet)}]
                    </span>
                    {l.title}
                    <span className="text-xs text-neutral-500 ml-2">
                      (
                      {l.status === "PAUSED"
                        ? "⏸ 일시중지"
                        : l.status === "CLOSED"
                        ? "마감"
                        : l.status}
                      {" · "}조회 {l.viewCount}회)
                    </span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/listings/${l.id}/edit`}
                      className="text-[11px] bg-neutral-200 text-neutral-700 px-2 py-1 rounded font-semibold"
                    >
                      ✏️ 수정
                    </Link>
                    <VerifyOwnershipButton
                      listingId={l.id}
                      initialVerified={!!l.ownershipVerifiedAt}
                    />
                  </div>
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

      <Section title={`계약 진행 / 완료 (${myDeals.length})`}>
        {myDeals.length === 0 ? (
          <Empty>진행 중이거나 완료된 계약이 없습니다.</Empty>
        ) : (
          <ul className="divide-y">
            {myDeals.map((d) => {
              const cd = d.contractData ? JSON.parse(d.contractData) : {};
              const bothSigned = !!cd.buyerSignature && !!cd.sellerSignature;
              const label = bothSigned ? "✅ 계약 체결" : "📝 진행 중";
              const color = bothSigned ? "text-green-700" : "text-blue-700";
              return (
                <li key={d.id} className="py-2">
                  <Link href={`/deals/${d.id}`} className="hover:text-pink-600">
                    {d.listing.title} —{" "}
                    {d.agreedPrice.toLocaleString()}만원{" "}
                    <span className={`text-xs font-semibold ${color}`}>{label}</span>
                  </Link>
                </li>
              );
            })}
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
