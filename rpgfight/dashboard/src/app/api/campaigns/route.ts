import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { stages: true } } },
  });
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const campaign = await prisma.campaign.create({
    data: { name: body.name, description: body.description ?? "", sortOrder: body.sortOrder ?? 0, isActive: body.isActive ?? true },
  });
  return NextResponse.json(campaign, { status: 201 });
}
