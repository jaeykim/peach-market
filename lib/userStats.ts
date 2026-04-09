import { prisma } from "./db";

export type UserStats = {
  ratingAvg: number | null;
  reviewCount: number;
  completedDealCount: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const reviews = await prisma.review.findMany({
    where: { targetId: userId },
    select: { rating: true },
  });
  const completedDealCount = await prisma.deal.count({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      status: "COMPLETED",
    },
  });
  const reviewCount = reviews.length;
  const ratingAvg =
    reviewCount === 0
      ? null
      : reviews.reduce((s, r) => s + r.rating, 0) / reviewCount;
  return { ratingAvg, reviewCount, completedDealCount };
}
