import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const types = await prisma.tileType.findMany({ orderBy: { code: "asc" } });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  const body = await req.json();
  const tt = await prisma.tileType.create({ data: body });
  return NextResponse.json(tt, { status: 201 });
}
