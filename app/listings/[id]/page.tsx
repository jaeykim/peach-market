import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ApplyButton from "@/components/ApplyButton";
import RegistryViewer from "@/components/RegistryViewer";
import FavoriteButton from "@/components/FavoriteButton";
import MatchRecommendations from "@/components/MatchRecommendations";
import PhotoGallery from "@/components/PhotoGallery";
import ReportButton from "@/components/ReportButton";
import { getUserStats } from "@/lib/userStats";
import { sideLongLabel, priceRangeLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, verifiedAt: true } },
    },
  });
  if (!listing) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === listing.ownerId;

  // 조회수 증가 + 최근 본 매물 기록 (소유자 본인 제외)
  if (user && !isOwner) {
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    await prisma.recentView.upsert({
      where: { userId_listingId: { userId: user.id, listingId: id } },
      create: { userId: user.id, listingId: id },
      update: { viewedAt: new Date() },
    });
  } else if (!user) {
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  const isFavorited = user
    ? !!(await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: user.id, listingId: id } },
      }))
    : false;

  const ownerStats = await getUserStats(listing.ownerId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            listing.side === "SELL" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {sideLongLabel(listing.dealType, listing.side, listing.isSublet)}
        </span>
        {listing.isShortTerm && (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
            ⏳ 단기 {listing.rentalMonths ? `${listing.rentalMonths}개월` : ""}
          </span>
        )}
        {listing.ownershipVerifiedAt ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">
            ✓ 소유권 검증 완료
          </span>
        ) : (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-500">
            ⚠️ 소유권 미검증
          </span>
        )}
        <span className="text-xs text-neutral-500">
          {listing.status === "OPEN" ? "협상 대기" : listing.status === "IN_NEGOTIATION" ? "협상 중" : "마감"}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold">{listing.title}</h1>
        <FavoriteButton listingId={listing.id} initial={isFavorited} loggedIn={!!user} />
      </div>
      <p className="text-neutral-600 mb-1">
        {listing.address} {listing.addressDetail}
      </p>
      <p className="text-xs text-neutral-400 mb-4">
        조회 {listing.viewCount.toLocaleString()}회
      </p>

      {parsePhotos(listing.photos).length > 0 && (
        <div className="mb-6">
          <PhotoGallery photos={parsePhotos(listing.photos)} alt={listing.title} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg bg-white p-4 space-y-2 text-sm">
          <Row
            label={
              listing.dealType === "MONTHLY"
                ? "월세"
                : listing.dealType === "JEONSE"
                ? "전세금"
                : "매매가"
            }
            value={
              listing.side === "BUY" && (listing.priceMin || listing.priceMax)
                ? priceRangeLabel(listing.askingPrice, listing.priceMin, listing.priceMax)
                : formatPrice(listing.askingPrice)
            }
            bold
          />
          {listing.dealType === "MONTHLY" && listing.deposit != null && (
            <Row label="보증금" value={formatPrice(listing.deposit)} />
          )}
          <Row label="거래 유형" value={dealTypeLabel(listing.dealType)} />
          <Row label="매물 종류" value={propTypeLabel(listing.propertyType)} />
          {listing.areaExclusive && (
            <Row
              label="전용면적"
              value={`${listing.areaExclusive}㎡ (${(listing.areaExclusive / 3.3058).toFixed(1)}평)`}
            />
          )}
          {listing.areaSupply && <Row label="공급면적" value={`${listing.areaSupply}㎡`} />}
          {listing.floor && (
            <Row label="층" value={`${listing.floor}/${listing.totalFloors ?? "?"}층`} />
          )}
          {listing.builtYear && <Row label="준공 연도" value={`${listing.builtYear}년`} />}
          {listing.rooms && <Row label="방/욕실" value={`${listing.rooms}/${listing.bathrooms ?? "?"}`} />}
          {listing.maintenanceFee && (
            <Row label="관리비" value={`${listing.maintenanceFee.toLocaleString()}원`} />
          )}
          <Row
            label="등록자"
            value={`${listing.owner.name}${listing.owner.verifiedAt ? " ✅ 인증" : ""}${
              ownerStats.ratingAvg
                ? ` · ★${ownerStats.ratingAvg.toFixed(1)} (${ownerStats.reviewCount})`
                : ""
            }${
              ownerStats.completedDealCount > 0
                ? ` · 거래 ${ownerStats.completedDealCount}회`
                : ""
            }`}
          />
        </div>

        <div className="space-y-4">
          {listing.description && (
            <div className="border rounded-lg bg-white p-4 text-sm whitespace-pre-wrap">
              {listing.description}
            </div>
          )}
          <ApplyButton
            listingId={listing.id}
            listingTitle={listing.title}
            monthlyAmount={listing.askingPrice}
            deposit={listing.deposit}
            isShortTerm={listing.isShortTerm}
            rentalMonths={listing.rentalMonths}
            isOwner={isOwner}
            isLoggedIn={!!user}
            isClosed={listing.status === "CLOSED"}
            ownershipVerified={!!listing.ownershipVerifiedAt}
          />
          {user && <RegistryViewer listingId={listing.id} />}
          <MatchRecommendations listingId={listing.id} />
          {!isOwner && (
            <ReportButton listingId={listing.id} loggedIn={!!user} />
          )}
        </div>
      </div>
    </div>
  );
}

function parsePhotos(s: string | null): string[] {
  if (!s) return [];
  try {
    const arr = JSON.parse(s);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b py-1.5">
      <span className="text-neutral-500">{label}</span>
      <span className={bold ? "font-bold text-pink-600" : ""}>{value}</span>
    </div>
  );
}

// 입력 단위: 만원
function formatPrice(man: number) {
  if (man >= 10_000) {
    const eok = Math.floor(man / 10_000);
    const rest = man % 10_000;
    return rest ? `${eok}억 ${rest.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${man.toLocaleString()}만원`;
}

function dealTypeLabel(t: string) {
  return { SALE: "매매", JEONSE: "전세", MONTHLY: "월세" }[t] || t;
}
function propTypeLabel(t: string) {
  return ({
    APT: "아파트",
    OFFICETEL: "오피스텔",
    VILLA: "빌라/연립",
    HOUSE: "단독주택",
    MULTI_FAMILY: "다가구주택",
    STUDIO: "원룸/투룸",
    SHOP: "상가",
    OFFICE: "사무실",
    KNOWLEDGE: "지식산업센터",
    BUILDING: "건물(꼬마빌딩)",
    FACTORY: "공장",
    WAREHOUSE: "창고",
    LODGING: "숙박시설",
    LAND: "토지",
  } as Record<string, string>)[t] || t;
}
