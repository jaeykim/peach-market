import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      residentNumber: user.residentNumber,
      address: user.address,
    },
  });
}

const Patch = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  residentNumber: z.string().optional(),
  address: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 입력" }, { status: 400 });
  }
  const { name, phone, residentNumber, address, currentPassword, newPassword } = parsed.data;

  const data: {
    name?: string;
    phone?: string;
    residentNumber?: string;
    address?: string;
    password?: string;
  } = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone;
  if (residentNumber !== undefined) data.residentNumber = residentNumber;
  if (address !== undefined) data.address = address;

  if (newPassword) {
    if (!currentPassword || !(await verifyPassword(currentPassword, user.password))) {
      return NextResponse.json({ error: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
    }
    data.password = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
    },
  });
}
