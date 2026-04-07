import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const CreateBody = z.object({
  side: z.enum(["SELL", "BUY"]),
  address: z.string().min(1),
  addressDetail: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  title: z.string().min(1),
  propertyType: z.string(),
  areaExclusive: z.number().optional(),
  areaSupply: z.number().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  direction: z.string().optional(),
  builtYear: z.number().int().optional(),
  rooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  maintenanceFee: z.number().int().optional(),
  askingPrice: z.number().int().nonnegative(),
  dealType: z.enum(["SALE", "JEONSE", "MONTHLY"]),
  description: z.string().optional(),
});

// GET /api/listings — 지도에 표시할 매물 목록 (공개 정보만)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const side = url.searchParams.get("side"); // SELL/BUY/null=all
  const where = side ? { side, status: { not: "CLOSED" } } : { status: { not: "CLOSED" } };

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      side: true,
      title: true,
      address: true,
      lat: true,
      lng: true,
      askingPrice: true,
      dealType: true,
      propertyType: true,
      areaExclusive: true,
      status: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const parsed = CreateBody.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: { ...parsed.data, ownerId: user.id },
  });
  return NextResponse.json({ listing });
}
