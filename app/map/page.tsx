import MapView from "@/components/MapView";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MapPage() {
  const rows = await prisma.listing.findMany({
    where: { status: { in: ["OPEN", "IN_NEGOTIATION"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      side: true,
      title: true,
      address: true,
      lat: true,
      lng: true,
      askingPrice: true,
      deposit: true,
      dealType: true,
      propertyType: true,
      areaExclusive: true,
      photos: true,
      isSublet: true,
      isShortTerm: true,
      rentalMonths: true,
      ownershipVerifiedAt: true,
      bids: {
        where: { status: { notIn: ["REJECTED", "WITHDRAWN"] } },
        select: { proposerId: true },
      },
    },
  });

  const listings = rows.map(({ bids, ownershipVerifiedAt, ...rest }) => ({
    ...rest,
    ownershipVerified: !!ownershipVerifiedAt,
    negotiationCount: new Set(bids.map((b) => b.proposerId)).size,
  }));

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">🏠 동네 월세</h1>
      <p className="text-sm text-neutral-600 mb-4">
        수수료 없는 월세·단기·전대. 동네에서 직접 만나 계약하세요.
      </p>
      <MapView clientId={clientId} listings={listings} />
    </div>
  );
}
