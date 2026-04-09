import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성 시작...");

  // 기존 데이터 정리
  await prisma.bid.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // 시연용 공인중개사 3명
  await Promise.all([
    prisma.user.create({
      data: {
        email: "broker1@peach.market",
        password,
        name: "최중개",
        phone: "010-9001-1001",
        verifiedAt: new Date(),
        isBroker: true,
        brokerLicense: "서울-2018-01234",
        brokerOffice: "피치공인중개사사무소",
        brokerRegion: "서울 강남구",
      },
    }),
    prisma.user.create({
      data: {
        email: "broker2@peach.market",
        password,
        name: "박부동",
        phone: "010-9002-2002",
        verifiedAt: new Date(),
        isBroker: true,
        brokerLicense: "서울-2020-05678",
        brokerOffice: "트러스트공인중개",
        brokerRegion: "서울 마포구",
      },
    }),
    prisma.user.create({
      data: {
        email: "broker3@peach.market",
        password,
        name: "이공인",
        phone: "010-9003-3003",
        verifiedAt: new Date(),
        isBroker: true,
        brokerLicense: "서울-2022-09876",
        brokerOffice: "성수공인중개",
        brokerRegion: "서울 성동구",
      },
    }),
  ]);

  // 사용자 4명
  const [seller1, seller2, buyer1, buyer2] = await Promise.all([
    prisma.user.create({
      data: { email: "seller1@peach.market", password, name: "김매도", phone: "010-1111-1111" },
    }),
    prisma.user.create({
      data: { email: "seller2@peach.market", password, name: "이판매", phone: "010-2222-2222" },
    }),
    prisma.user.create({
      data: { email: "buyer1@peach.market", password, name: "박매수", phone: "010-3333-3333" },
    }),
    prisma.user.create({
      data: { email: "buyer2@peach.market", password, name: "정구매", phone: "010-4444-4444" },
    }),
  ]);

  const photos = (...seeds: string[]) =>
    JSON.stringify(seeds.map((s) => `https://picsum.photos/seed/${s}/800/500`));

  // 매도 매물 (서울 주요 지역)
  const sellListings = [
    {
      ownerId: seller1.id, side: "SELL",
      title: "강남 래미안 84㎡ 남향 고층",
      address: "서울특별시 강남구 테헤란로 152",
      lat: 37.5006, lng: 127.0359,
      propertyType: "APT", dealType: "SALE",
      areaExclusive: 84, areaSupply: 110, floor: 18, totalFloors: 25,
      direction: "남향", builtYear: 2018, rooms: 3, bathrooms: 2,
      maintenanceFee: 250000, askingPrice: 250_000,
      description: "역세권 신축, 즉시 입주 가능. 풀옵션 빌트인.",
      photos: photos("ramian1", "ramian2", "ramian3"),
    },
    {
      ownerId: seller1.id, side: "SELL",
      title: "마포 한강뷰 오피스텔",
      address: "서울특별시 마포구 마포대로 144",
      lat: 37.5404, lng: 126.9462,
      propertyType: "OFFICETEL", dealType: "SALE",
      areaExclusive: 45, floor: 22, totalFloors: 30,
      direction: "남서향", builtYear: 2020, rooms: 1, bathrooms: 1,
      maintenanceFee: 180000, askingPrice: 75_000,
      description: "한강뷰 확정. 1인 가구 또는 신혼 추천.",
      photos: photos("officetel1", "officetel2"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "성수동 신축 빌라 전세",
      address: "서울특별시 성동구 성수일로 56",
      lat: 37.5447, lng: 127.0557,
      propertyType: "VILLA", dealType: "JEONSE",
      areaExclusive: 59, floor: 3, totalFloors: 5,
      direction: "동향", builtYear: 2023, rooms: 2, bathrooms: 1,
      askingPrice: 45_000,
      description: "신축 풀옵션. 2년 거주 가능.",
      photos: photos("villa1", "villa2"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "잠실 엘스 33평 매매",
      address: "서울특별시 송파구 올림픽로 99",
      lat: 37.5126, lng: 127.0825,
      propertyType: "APT", dealType: "SALE",
      areaExclusive: 84.9, areaSupply: 109, floor: 12, totalFloors: 33,
      direction: "남동향", builtYear: 2008, rooms: 3, bathrooms: 2,
      maintenanceFee: 320000, askingPrice: 230_000,
      description: "잠실 학군. 한강 도보 5분.",
      photos: photos("els1", "els2", "els3"),
    },
    {
      ownerId: seller1.id, side: "SELL",
      title: "용산 한남더힐 매매",
      address: "서울특별시 용산구 독서당로 111",
      lat: 37.5396, lng: 127.0021,
      propertyType: "APT", dealType: "SALE",
      areaExclusive: 235, areaSupply: 280, floor: 5, totalFloors: 12,
      direction: "남향", builtYear: 2011, rooms: 4, bathrooms: 3,
      maintenanceFee: 850000, askingPrice: 750_000,
      description: "프리미엄 단지. 하이엔드 가전 풀옵션.",
      photos: photos("hannamhill1", "hannamhill2", "hannamhill3", "hannamhill4"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "연남동 단독주택 월세",
      address: "서울특별시 마포구 연남로 21",
      lat: 37.5635, lng: 126.9252,
      propertyType: "HOUSE", dealType: "MONTHLY",
      areaExclusive: 99, floor: 1, totalFloors: 2,
      builtYear: 1998, rooms: 3, bathrooms: 2,
      askingPrice: 500, deposit: 10_000,
      description: "보증금 1억 / 월세 500만원. 마당 있는 단독.",
      photos: photos("yeonnamhouse1", "yeonnamhouse2"),
    },
    {
      ownerId: seller1.id, side: "SELL",
      title: "강남역 1층 상가 매매 (역세권)",
      address: "서울특별시 강남구 강남대로 396",
      lat: 37.4983, lng: 127.0277,
      propertyType: "SHOP", dealType: "SALE",
      areaExclusive: 66, floor: 1, totalFloors: 12,
      builtYear: 2010,
      maintenanceFee: 450000, askingPrice: 350_000,
      description: "강남역 도보 3분, 1층 코너 상가. 유동 인구 풍부.",
      photos: photos("shop1", "shop2"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "성수 지식산업센터 사무실",
      address: "서울특별시 성동구 성수이로 113",
      lat: 37.5444, lng: 127.0556,
      propertyType: "KNOWLEDGE", dealType: "SALE",
      areaExclusive: 99, areaSupply: 165, floor: 8, totalFloors: 15,
      builtYear: 2019,
      maintenanceFee: 320000, askingPrice: 95_000,
      description: "지하철 분당선/2호선 더블 역세권. 천장 높이 4.2m.",
      photos: photos("knowledge1", "knowledge2", "knowledge3"),
    },
    {
      ownerId: seller1.id, side: "SELL",
      title: "신촌 원룸 월세",
      address: "서울특별시 서대문구 연세로 50",
      lat: 37.5586, lng: 126.9367,
      propertyType: "STUDIO", dealType: "MONTHLY",
      areaExclusive: 23, floor: 4, totalFloors: 6,
      builtYear: 2015, rooms: 1, bathrooms: 1,
      askingPrice: 60, deposit: 1_000,
      description: "신촌역 도보 5분. 풀옵션 원룸. 보증금 1000/월 60.",
      photos: photos("studio1", "studio2"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "여의도 사무실 임대",
      address: "서울특별시 영등포구 의사당대로 1",
      lat: 37.5266, lng: 126.9183,
      propertyType: "OFFICE", dealType: "MONTHLY",
      areaExclusive: 132, areaSupply: 198, floor: 14, totalFloors: 20,
      builtYear: 2012,
      maintenanceFee: 700000, askingPrice: 800, deposit: 8_000,
      description: "여의도 핵심 권역. 보증금 8천 / 월 800만원.",
      photos: photos("office1", "office2"),
    },
    {
      ownerId: seller1.id, side: "SELL",
      title: "성북동 꼬마빌딩 매매",
      address: "서울특별시 성북구 성북로 100",
      lat: 37.5910, lng: 127.0048,
      propertyType: "BUILDING", dealType: "SALE",
      areaExclusive: 330, totalFloors: 4,
      builtYear: 2005,
      askingPrice: 1_800_000,
      description: "지하 1층 / 지상 4층 꼬마빌딩. 임대 수익률 4.2%.",
      photos: photos("building1", "building2", "building3"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "김포 물류 창고 임대",
      address: "경기도 김포시 양촌읍 학운산단로 200",
      lat: 37.6500, lng: 126.6450,
      propertyType: "WAREHOUSE", dealType: "MONTHLY",
      areaExclusive: 1650,
      builtYear: 2018,
      askingPrice: 2_500, deposit: 30_000,
      description: "수도권 서부 핵심 물류거점. 천장고 9m, 도크 4면.",
      photos: photos("warehouse1", "warehouse2"),
    },
    {
      ownerId: seller1.id, side: "SELL",
      title: "평택 공장 매매",
      address: "경기도 평택시 청북읍 서동대로 1500",
      lat: 36.9700, lng: 126.9000,
      propertyType: "FACTORY", dealType: "SALE",
      areaExclusive: 2310, totalFloors: 2,
      builtYear: 2014,
      askingPrice: 4_500_000,
      description: "근린생활 + 공장 등록. 전기 500kW. 즉시 가동 가능.",
      photos: photos("factory1", "factory2"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "남양주 토지 매매",
      address: "경기도 남양주시 화도읍 마석우리 산 12",
      lat: 37.6550, lng: 127.3120,
      propertyType: "LAND", dealType: "SALE",
      areaExclusive: 1320,
      askingPrice: 95_000,
      description: "계획관리지역, 진입로 확보. 전원주택 부지로 적합.",
      photos: photos("land1", "land2"),
    },
    {
      ownerId: seller2.id, side: "SELL",
      title: "홍대 빌라 전세",
      address: "서울특별시 마포구 와우산로 94",
      lat: 37.5547, lng: 126.9252,
      propertyType: "VILLA", dealType: "JEONSE",
      areaExclusive: 49, floor: 2, totalFloors: 4,
      builtYear: 2017, rooms: 2, bathrooms: 1,
      askingPrice: 38_000,
      description: "홍대입구역 도보 5분. 2년 만기 후 재계약 가능.",
      photos: photos("hongdae1", "hongdae2"),
    },
  ];

  // 매수 희망 2건
  const buyListings = [
    {
      ownerId: buyer1.id, side: "BUY",
      title: "강남권 84㎡ 매매 찾습니다",
      address: "서울특별시 강남구 역삼로",
      lat: 37.5012, lng: 127.0356,
      propertyType: "APT", dealType: "SALE",
      areaExclusive: 84, rooms: 3, bathrooms: 2,
      askingPrice: 230_000,
      description: "강남구 내 84㎡ 이상 신축급 찾고 있습니다. 23억 이내.",
    },
    {
      ownerId: buyer2.id, side: "BUY",
      title: "마포/서대문 전세 60㎡",
      address: "서울특별시 마포구 신촌로",
      lat: 37.5559, lng: 126.9368,
      propertyType: "APT", dealType: "JEONSE",
      areaExclusive: 60, rooms: 2, bathrooms: 1,
      askingPrice: 50_000,
      description: "신혼 부부, 마포·서대문권 전세 찾습니다.",
    },
    {
      ownerId: buyer2.id, side: "BUY",
      title: "성수 지산 사무실 매수 희망",
      address: "서울특별시 성동구 성수이로",
      lat: 37.5440, lng: 127.0560,
      propertyType: "KNOWLEDGE", dealType: "SALE",
      areaExclusive: 100,
      askingPrice: 90_000,
      description: "성수 지식산업센터 100㎡ 내외 매수 희망. 9억 이내.",
    },
  ];

  for (const data of [...sellListings, ...buyListings]) {
    await prisma.listing.create({ data });
  }

  // 샘플 비드: 강남 래미안 매물에 buyer1이 24억 제안
  const ramian = await prisma.listing.findFirst({
    where: { title: { contains: "래미안" } },
  });
  if (ramian) {
    await prisma.bid.create({
      data: {
        listingId: ramian.id,
        proposerId: buyer1.id,
        amount: 240_000,
        message: "24억에 매수 의사 있습니다. 잔금 60일 가능.",
      },
    });
    await prisma.listing.update({
      where: { id: ramian.id },
      data: { status: "IN_NEGOTIATION" },
    });
  }

  console.log("✅ 시드 완료");
  console.log("계정:");
  console.log("  seller1@peach.market / password123 (김매도)");
  console.log("  seller2@peach.market / password123 (이판매)");
  console.log("  buyer1@peach.market  / password123 (박매수)");
  console.log("  buyer2@peach.market  / password123 (정구매)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
