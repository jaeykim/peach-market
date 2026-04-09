import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성 시작 (Phase 1: 대학가 월세·단기·전대)...");

  // 기존 데이터 정리
  await prisma.chatMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.recentView.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const photos = (...seeds: string[]) =>
    JSON.stringify(seeds.map((s) => `https://picsum.photos/seed/${s}/800/500`));

  // 집주인 3명 + 학생 4명
  const [landlord1, landlord2, landlord3, student1, student2, student3, student4] =
    await Promise.all([
      prisma.user.create({
        data: {
          email: "landlord1@peach.market",
          password,
          name: "박주인",
          phone: "010-1111-1111",
          verifiedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          email: "landlord2@peach.market",
          password,
          name: "김건물",
          phone: "010-2222-2222",
          verifiedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          email: "landlord3@peach.market",
          password,
          name: "이원룸",
          phone: "010-3333-3333",
          verifiedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          email: "student1@peach.market",
          password,
          name: "홍학생",
          phone: "010-4444-4444",
        },
      }),
      prisma.user.create({
        data: {
          email: "student2@peach.market",
          password,
          name: "최신입",
          phone: "010-5555-5555",
        },
      }),
      prisma.user.create({
        data: {
          email: "student3@peach.market",
          password,
          name: "정교환",
          phone: "010-6666-6666",
        },
      }),
      prisma.user.create({
        data: {
          email: "student4@peach.market",
          password,
          name: "윤인턴",
          phone: "010-7777-7777",
        },
      }),
    ]);

  // 대학가 월세·단기임대·전대 매물
  type Data = Parameters<typeof prisma.listing.create>[0]["data"];
  const listings: Data[] = [
    // === 신촌 / 연세대 / 이화여대 ===
    {
      ownerId: landlord1.id,
      side: "SELL",
      title: "연세대 정문 도보 5분 풀옵션 원룸",
      address: "서울특별시 서대문구 연세로 50",
      addressDetail: "2층 201호",
      lat: 37.5586,
      lng: 126.9367,
      propertyType: "STUDIO",
      dealType: "MONTHLY",
      areaExclusive: 23,
      floor: 2,
      totalFloors: 5,
      direction: "남향",
      builtYear: 2019,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 70000,
      askingPrice: 55,
      deposit: 1_000,
      description:
        "연세대 정문 도보 5분. 세탁기·냉장고·인덕션·에어컨·책상·침대 풀옵션. 개별 화장실. 여학생 선호.",
      photos: photos("yonsei1", "yonsei2", "yonsei3"),
    },
    {
      ownerId: landlord1.id,
      side: "SELL",
      title: "이대 후문 단기임대 (3개월)",
      address: "서울특별시 서대문구 이화여대길 52",
      lat: 37.5619,
      lng: 126.9469,
      propertyType: "STUDIO",
      dealType: "MONTHLY",
      isShortTerm: true,
      rentalMonths: 3,
      areaExclusive: 19,
      floor: 3,
      totalFloors: 4,
      direction: "동향",
      builtYear: 2017,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 50000,
      askingPrice: 70,
      deposit: 500,
      description:
        "2026년 여름방학 3개월 단기. 교환학생·인턴십·방학 계절학기 학생 환영. 풀옵션, 즉시 입주.",
      photos: photos("ewha1", "ewha2"),
    },
    {
      ownerId: landlord2.id,
      side: "SELL",
      title: "연대 앞 전대 매물 (계약 1년 남음)",
      address: "서울특별시 서대문구 신촌로 105",
      lat: 37.5560,
      lng: 126.9393,
      propertyType: "STUDIO",
      dealType: "MONTHLY",
      isSublet: true,
      rentalMonths: 12,
      areaExclusive: 25,
      floor: 4,
      totalFloors: 6,
      builtYear: 2018,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 60000,
      askingPrice: 60,
      deposit: 800,
      description:
        "교환학생 합격으로 급매 전대. 원계약 2027년 4월 만료. 풀옵션, 화장실 분리형.",
      photos: photos("shinchon1", "shinchon2"),
    },

    // === 홍대 / 합정 ===
    {
      ownerId: landlord2.id,
      side: "SELL",
      title: "홍대입구역 도보 3분 신축 원룸",
      address: "서울특별시 마포구 와우산로 94",
      addressDetail: "5층 501호",
      lat: 37.5547,
      lng: 126.9252,
      propertyType: "STUDIO",
      dealType: "MONTHLY",
      areaExclusive: 26,
      floor: 5,
      totalFloors: 7,
      direction: "남동향",
      builtYear: 2023,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 80000,
      askingPrice: 65,
      deposit: 1_500,
      description:
        "홍대입구역 2호선·공항철도·경의중앙선 트리플 역세권. 신축 풀옵션. CCTV·카드키·택배보관함.",
      photos: photos("hongdae1", "hongdae2", "hongdae3"),
    },
    {
      ownerId: landlord3.id,
      side: "SELL",
      title: "합정 단기임대 6개월 (세미나·프리랜서용)",
      address: "서울특별시 마포구 양화로 45",
      lat: 37.5495,
      lng: 126.9139,
      propertyType: "OFFICETEL",
      dealType: "MONTHLY",
      isShortTerm: true,
      rentalMonths: 6,
      areaExclusive: 32,
      floor: 8,
      totalFloors: 15,
      direction: "서향",
      builtYear: 2020,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 90000,
      askingPrice: 90,
      deposit: 2_000,
      description:
        "합정역 1분. 오피스텔형 단기임대. 업무책상·빔프로젝터·고속 와이파이. 6개월 이상만.",
      photos: photos("hapjeong1", "hapjeong2"),
    },

    // === 안암 / 고려대 ===
    {
      ownerId: landlord3.id,
      side: "SELL",
      title: "고대 후문 월세 2룸",
      address: "서울특별시 성북구 안암로 145",
      addressDetail: "3층",
      lat: 37.5892,
      lng: 127.0326,
      propertyType: "VILLA",
      dealType: "MONTHLY",
      areaExclusive: 36,
      floor: 3,
      totalFloors: 4,
      builtYear: 2015,
      rooms: 2,
      bathrooms: 1,
      maintenanceFee: 50000,
      askingPrice: 75,
      deposit: 3_000,
      description: "고려대 후문 도보 7분. 2인 가능. 분리형 2룸, 세탁기·냉장고 포함.",
      photos: photos("korea1", "korea2"),
    },

    // === 관악 / 서울대 ===
    {
      ownerId: landlord1.id,
      side: "SELL",
      title: "서울대입구역 저렴한 원룸",
      address: "서울특별시 관악구 봉천로 485",
      lat: 37.4825,
      lng: 126.9549,
      propertyType: "STUDIO",
      dealType: "MONTHLY",
      areaExclusive: 18,
      floor: 2,
      totalFloors: 5,
      direction: "북향",
      builtYear: 2010,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 40000,
      askingPrice: 45,
      deposit: 500,
      description:
        "서울대입구역 도보 10분. 저렴한 월세. 세탁기·냉장고·책상 기본 옵션. 가성비 좋음.",
      photos: photos("snu1", "snu2"),
    },

    // === 왕십리 / 한양대 ===
    {
      ownerId: landlord2.id,
      side: "SELL",
      title: "한양대 도보권 투룸 전대",
      address: "서울특별시 성동구 마장로 210",
      lat: 37.5576,
      lng: 127.0433,
      propertyType: "VILLA",
      dealType: "MONTHLY",
      isSublet: true,
      rentalMonths: 8,
      areaExclusive: 42,
      floor: 2,
      totalFloors: 4,
      builtYear: 2016,
      rooms: 2,
      bathrooms: 1,
      maintenanceFee: 60000,
      askingPrice: 80,
      deposit: 2_000,
      description:
        "한양대 도보 8분. 졸업으로 전대 내놓음. 2027년 11월 원계약 만료. 2인 룸메이트 가능.",
      photos: photos("hanyang1", "hanyang2"),
    },

    // === 혜화 / 성균관대 ===
    {
      ownerId: landlord3.id,
      side: "SELL",
      title: "성대 인문캠 근처 조용한 원룸",
      address: "서울특별시 종로구 명륜3가",
      addressDetail: "15-2 3층",
      lat: 37.5838,
      lng: 127.0019,
      propertyType: "STUDIO",
      dealType: "MONTHLY",
      areaExclusive: 21,
      floor: 3,
      totalFloors: 4,
      direction: "남향",
      builtYear: 2014,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 45000,
      askingPrice: 55,
      deposit: 1_000,
      description:
        "성균관대 인문캠 도보 5분. 혜화역 10분. 조용한 주택가. 세탁기·냉장고·책상.",
      photos: photos("skku1", "skku2"),
    },

    // === 건대 ===
    {
      ownerId: landlord1.id,
      side: "SELL",
      title: "건대입구역 깨끗한 원룸",
      address: "서울특별시 광진구 화양동",
      addressDetail: "49-11",
      lat: 37.5402,
      lng: 127.0703,
      propertyType: "STUDIO",
      dealType: "MONTHLY",
      areaExclusive: 24,
      floor: 4,
      totalFloors: 5,
      direction: "동향",
      builtYear: 2020,
      rooms: 1,
      bathrooms: 1,
      maintenanceFee: 70000,
      askingPrice: 60,
      deposit: 1_200,
      description: "건대입구역 도보 6분. 7호선·2호선 더블. 풀옵션 신축급.",
      photos: photos("kku1", "kku2"),
    },

  ];

  for (const data of listings) {
    await prisma.listing.create({ data });
  }

  // 데모 비드 1건: student2가 연세대 원룸에 월 50 제안
  const yonsei = await prisma.listing.findFirst({
    where: { title: { contains: "연세대 정문" } },
  });
  if (yonsei) {
    await prisma.bid.create({
      data: {
        listingId: yonsei.id,
        proposerId: student2.id,
        amount: 50,
        message: "학생입니다. 월 50에 가능하실까요? 1년 계약 희망합니다.",
      },
    });
    await prisma.listing.update({
      where: { id: yonsei.id },
      data: { status: "IN_NEGOTIATION" },
    });
  }

  console.log("✅ Phase 1 시드 완료 (대학가 월세·단기·전대)");
  console.log("");
  console.log("🏠 집주인 계정 (비밀번호: password123)");
  console.log("  landlord1@peach.market  박주인");
  console.log("  landlord2@peach.market  김건물");
  console.log("  landlord3@peach.market  이원룸");
  console.log("");
  console.log("🎓 학생 계정 (비밀번호: password123)");
  console.log("  student1@peach.market   홍학생  (연세대 원룸 구함)");
  console.log("  student2@peach.market   최신입  (연세대 정문 원룸에 50 비드 진행중)");
  console.log("  student3@peach.market   정교환  (홍대 단기 구함)");
  console.log("  student4@peach.market   윤인턴");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
