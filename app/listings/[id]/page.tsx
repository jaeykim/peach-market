import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import BidPanel from "@/components/BidPanel";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true } } },
  });
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === listing.ownerId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            listing.side === "SELL" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {listing.side === "SELL" ? "매도 매물" : "매수 희망"}
        </span>
        <span className="text-xs text-neutral-500">
          {listing.status === "OPEN" ? "협상 대기" : listing.status === "IN_NEGOTIATION" ? "협상 중" : "마감"}
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-1">{listing.title}</h1>
      <p className="text-neutral-600 mb-4">
        {listing.address} {listing.addressDetail}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg bg-white p-4 space-y-2 text-sm">
          <Row label="희망 가격" value={formatPrice(listing.askingPrice)} bold />
          <Row label="거래 유형" value={dealTypeLabel(listing.dealType)} />
          <Row label="매물 종류" value={propTypeLabel(listing.propertyType)} />
          {listing.areaExclusive && <Row label="전용면적" value={`${listing.areaExclusive}㎡`} />}
          {listing.areaSupply && <Row label="공급면적" value={`${listing.areaSupply}㎡`} />}
          {listing.floor && (
            <Row label="층" value={`${listing.floor}/${listing.totalFloors ?? "?"}층`} />
          )}
          {listing.builtYear && <Row label="준공 연도" value={`${listing.builtYear}년`} />}
          {listing.rooms && <Row label="방/욕실" value={`${listing.rooms}/${listing.bathrooms ?? "?"}`} />}
          {listing.maintenanceFee && (
            <Row label="관리비" value={`${listing.maintenanceFee.toLocaleString()}원`} />
          )}
          <Row label="등록자" value={listing.owner.name} />
        </div>

        <div className="space-y-4">
          {listing.description && (
            <div className="border rounded-lg bg-white p-4 text-sm whitespace-pre-wrap">
              {listing.description}
            </div>
          )}
          <BidPanel
            listingId={listing.id}
            listingSide={listing.side}
            askingPrice={listing.askingPrice}
            isOwner={isOwner}
            isLoggedIn={!!user}
            isClosed={listing.status === "CLOSED"}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b py-1.5">
      <span className="text-neutral-500">{label}</span>
      <span className={bold ? "font-bold text-pink-600" : ""}>{value}</span>
    </div>
  );
}

function formatPrice(won: number) {
  if (won >= 100_000_000) {
    const eok = Math.floor(won / 100_000_000);
    const man = Math.round((won % 100_000_000) / 10_000);
    return man ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${Math.round(won / 10_000).toLocaleString()}만원`;
}

function dealTypeLabel(t: string) {
  return { SALE: "매매", JEONSE: "전세", MONTHLY: "월세" }[t] || t;
}
function propTypeLabel(t: string) {
  return { APT: "아파트", OFFICETEL: "오피스텔", HOUSE: "단독/다가구", VILLA: "빌라" }[t] || t;
}
