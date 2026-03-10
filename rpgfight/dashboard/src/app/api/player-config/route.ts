import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const config = await prisma.playerConfig.findFirst({ where: { name: "default" } });
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const config = await prisma.playerConfig.upsert({
    where: { name: "default" },
    update: body,
    create: { name: "default", ...body },
  });
  return NextResponse.json(config);
}
