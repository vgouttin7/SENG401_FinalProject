import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id: parseInt(id) },
    include: { stages: { orderBy: { stageNum: "asc" } } },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const campaign = await prisma.campaign.update({ where: { id: parseInt(id) }, data: body });
  return NextResponse.json(campaign);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.campaign.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
