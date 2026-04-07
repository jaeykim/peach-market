import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import DealContractForm from "@/components/DealContractForm";

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
    },
  });
  if (!deal) notFound();
  if (deal.buyerId !== user.id && deal.sellerId !== user.id) {
    return <div className="p-8">접근 권한이 없습니다.</div>;
  }

  const contractData = deal.contractData ? JSON.parse(deal.contractData) : {};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h1 className="text-xl font-bold text-green-800">🎉 딜이 성사되었습니다</h1>
        <p className="text-sm text-green-700 mt-1">
          이제 양측이 계약 정보를 확인하고 실제 계약으로 진행할 수 있습니다.
        </p>
      </div>

      <section className="border rounded-lg bg-white p-4 mb-6">
        <h2 className="font-bold mb-3">매물 정보</h2>
        <p className="text-sm text-neutral-600">{deal.listing.title}</p>
        <p className="text-sm text-neutral-600">
          {deal.listing.address} {deal.listing.addressDetail}
        </p>
        <p className="mt-2 text-lg font-bold text-pink-600">
          합의 가격: {formatPrice(deal.agreedPrice)}
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-6">
        <PartyCard title="매도인" party={deal.seller} />
        <PartyCard title="매수인" party={deal.buyer} />
      </section>

      <section className="border rounded-lg bg-white p-4">
        <h2 className="font-bold mb-3">계약 준비 정보</h2>
        <DealContractForm dealId={deal.id} initial={contractData} />
      </section>
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

function formatPrice(won: number) {
  if (won >= 100_000_000) {
    const eok = Math.floor(won / 100_000_000);
    const man = Math.round((won % 100_000_000) / 10_000);
    return man ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${Math.round(won / 10_000).toLocaleString()}만원`;
}
