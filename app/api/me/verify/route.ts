import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// 가짜 주민등록번호 생성 (데모 전용)
function fakeResidentNumber(): string {
  const yy = Math.floor(Math.random() * 30) + 70; // 70~99
  const mm = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const dd = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const gender = Math.random() < 0.5 ? "1" : "2";
  const rest = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `${yy}${mm}${dd}-${gender}${rest}`;
}

// 본인 인증 시뮬레이션 (PASS/NICE 연동 자리)
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifiedAt: new Date(),
      // 이미 입력된 값이 있으면 유지, 없으면 데모용 가짜 생성
      ...(user.residentNumber ? {} : { residentNumber: fakeResidentNumber() }),
    },
  });
  return NextResponse.json({ ok: true, verifiedAt: new Date() });
}
