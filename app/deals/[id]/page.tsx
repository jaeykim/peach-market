import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import DealWorkflow from "@/components/DealWorkflow";
import DealChat from "@/components/DealChat";
import PaymentCard from "@/components/PaymentCard";
import CompleteDealButton from "@/components/CompleteDealButton";
import ReviewSection from "@/components/ReviewSection";
import LandlordApprovalCard from "@/components/LandlordApprovalCard";

export const dynamic = "force-dynamic";

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true, email: true, phone: true } },
      seller: { select: { id: true, name: true, email: true, phone: true } },
      broker: {
        select: {
          id: true,
          name: true,
          brokerLicense: true,
          brokerOffice: true,
          brokerRegion: true,
        },
      },
    },
  });
  if (!deal) notFound();
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return <div className="p-8">접근 권한이 없습니다.</div>;
  }

  const contractData = deal.contractData ? JSON.parse(deal.contractData) : {};
  const bothSigned = !!contractData.buyerSignature && !!contractData.sellerSignature;
  const landlordApproved = deal.landlordApprovalStatus === "APPROVED";
  const landlordRejected = deal.landlordApprovalStatus === "REJECTED";
  const isBuyer = deal.buyerId === user.id;
  const isSeller = deal.sellerId === user.id;

  // 진행 단계 판단
  let banner: { title: string; desc: string; color: string };
  if (deal.status === "COMPLETED") {
    banner = {
      title: "🎉 입주 완료",
      desc: "에스크로 정산이 완료되어 거래가 종결되었습니다.",
      color: "green",
    };
  } else if (landlordRejected) {
    banner = {
      title: "❌ 신청이 거절되었습니다",
      desc: "가계약금은 자동 환불됩니다.",
      color: "red",
    };
  } else if (!landlordApproved) {
    banner = {
      title: "⏳ 집주인 수락 대기 중",
      desc: "가계약금이 에스크로에 보관되었습니다. 집주인이 수락하면 계약서가 자동 작성됩니다.",
      color: "yellow",
    };
  } else if (!bothSigned) {
    banner = {
      title: "📝 계약서 서명 진행 중",
      desc: "자동 생성된 계약서를 검토하고 서명해주세요.",
      color: "blue",
    };
  } else {
    banner = {
      title: "💰 잔금·보증금 에스크로 대기",
      desc: "양측 서명 완료. 이제 보증금과 첫 달 월세를 에스크로에 입금해주세요.",
      color: "blue",
    };
  }
  const bannerCls = {
    green: "bg-green-50 border-green-200 text-green-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    red: "bg-red-50 border-red-200 text-red-800",
  }[banner.color];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className={`border rounded-lg p-4 mb-6 ${bannerCls}`}>
        <h1 className="text-xl font-bold">{banner.title}</h1>
        <p className="text-sm mt-1 opacity-90">{banner.desc}</p>
      </div>

      <section className="border rounded-lg bg-white p-4 mb-6">
        <h2 className="font-bold mb-3">매물 정보</h2>
        <p className="text-sm text-neutral-600">{deal.listing.title}</p>
        <p className="text-sm text-neutral-600">
          {deal.listing.address} {deal.listing.addressDetail}
        </p>
        <p className="mt-2 text-lg font-bold text-pink-600">
          {deal.listing.dealType === "MONTHLY"
            ? "월세"
            : deal.listing.dealType === "JEONSE"
            ? "전세금"
            : "합의 가격"}
          : {formatPrice(deal.agreedPrice)}
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-6">
        <PartyCard title="매도인" party={deal.seller} />
        <PartyCard title="매수인" party={deal.buyer} />
      </section>


      {/* 1. 집주인 수락 카드 (가장 먼저) */}
      <div className="mb-6">
        <LandlordApprovalCard
          dealId={deal.id}
          isSeller={isSeller}
          status={deal.landlordApprovalStatus}
          earnestMoney={deal.earnestMoney}
          buyerName={deal.buyer.name}
          rejectReason={deal.landlordRejectReason}
        />
      </div>

      {/* 2. 계약서 + 서명 워크플로우 (수락 후에만 의미) */}
      {landlordApproved && (
        <DealWorkflow
          dealId={deal.id}
          initialContract={contractData.generatedContract ?? null}
          initialBroker={deal.broker}
          isBuyer={isBuyer}
          isSeller={isSeller}
          initialBuyerSignature={contractData.buyerSignature ?? null}
          initialSellerSignature={contractData.sellerSignature ?? null}
        />
      )}

      {/* 3. 보증금·월세 에스크로 결제 (양측 서명 후) */}
      {landlordApproved && bothSigned && deal.listing.dealType !== "SALE" && (
        <div className="mt-6">
          <PaymentCard
            dealId={deal.id}
            isBuyer={isBuyer}
            isSeller={isSeller}
            dealType={deal.listing.dealType}
            isShortTerm={deal.listing.isShortTerm}
            rentalMonths={deal.listing.rentalMonths}
            monthlyAmount={deal.agreedPrice}
            depositAmount={deal.listing.deposit}
          />
        </div>
      )}

      <div className="mt-6">
        <CompleteDealButton
          dealId={deal.id}
          canComplete={
            !!contractData.buyerSignature &&
            !!contractData.sellerSignature &&
            deal.status !== "COMPLETED" &&
            deal.buyerId === user.id
          }
          alreadyCompleted={deal.status === "COMPLETED"}
        />
      </div>

      <div className="mt-6">
        <ReviewSection
          dealId={deal.id}
          currentUserId={user.id}
          enabled={deal.status === "COMPLETED"}
        />
      </div>

      <div className="mt-6">
        <DealChat dealId={deal.id} currentUserId={user.id} />
      </div>
    </div>
  );
}

function PartyCard({
  title,
  party,
}: {
  title: string;
  party: { name: string; email: string; phone: string | null };
}) {
  return (
    <div className="border rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-neutral-500 mb-2">{title}</h3>
      <p className="font-bold">{party.name}</p>
      <p className="text-sm">{party.email}</p>
      <p className="text-sm">{party.phone || "(연락처 미등록)"}</p>
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
