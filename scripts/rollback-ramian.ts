import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const listing = await prisma.listing.findFirst({
    where: { title: { contains: "래미안" } },
  });
  if (!listing) {
    console.log("매물 없음");
    return;
  }

  // 해당 매물의 모든 딜 삭제 (채팅 메시지 cascade 처리)
  const deals = await prisma.deal.findMany({ where: { listingId: listing.id } });
  for (const d of deals) {
    await prisma.chatMessage.deleteMany({ where: { dealId: d.id } });
    await prisma.deal.delete({ where: { id: d.id } });
  }

  // 모든 비드 삭제
  await prisma.bid.deleteMany({ where: { listingId: listing.id } });

  // 매물 상태 OPEN으로 되돌리기
  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: "OPEN" },
  });

  // 새로 데모용 비드 1개 추가 (buyer1이 24억)
  const buyer1 = await prisma.user.findUnique({ where: { email: "buyer1@peach.market" } });
  if (buyer1) {
    await prisma.bid.create({
      data: {
        listingId: listing.id,
        proposerId: buyer1.id,
        amount: 240_000,
        message: "24억에 매수 의사 있습니다. 잔금 60일 가능.",
      },
    });
    await prisma.listing.update({
      where: { id: listing.id },
      data: { status: "IN_NEGOTIATION" },
    });
  }

  console.log("✅ 강남 래미안 롤백 완료. 비드 1건만 남음 (PENDING).");
}

main().finally(() => prisma.$disconnect());
