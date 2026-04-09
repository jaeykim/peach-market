import MapView from "@/components/MapView";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MapPage() {
  const rows = await prisma.listing.findMany({
    where: { status: { not: "CLOSED" } },
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
      bids: {
        where: { status: { notIn: ["REJECTED", "WITHDRAWN"] } },
        select: { proposerId: true },
      },
    },
  });

  const listings = rows.map(({ bids, ...rest }) => ({
    ...rest,
    negotiationCount: new Set(bids.map((b) => b.proposerId)).size,
  }));

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">투명한 부동산 거래</h1>
      <p className="text-sm text-neutral-600 mb-4">
        지도에서 매물을 확인하고, 중개인 없이 매도자/매수자가 직접 협상하세요.
      </p>
      <MapView clientId={clientId} listings={listings} />
    </div>
  );
}
