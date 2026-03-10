import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enemies = await prisma.stageEnemy.findMany({
    where: { stageId: parseInt(id) },
    include: { enemyTemplate: true },
  });
  return NextResponse.json(enemies);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const se = await prisma.stageEnemy.create({
    data: { stageId: parseInt(id), enemyTemplateId: body.enemyTemplateId, minSpeed: body.minSpeed ?? 1, maxSpeed: body.maxSpeed ?? 3 },
    include: { enemyTemplate: true },
  });
  return NextResponse.json(se, { status: 201 });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  await prisma.stageEnemy.delete({ where: { id: body.stageEnemyId } });
  return NextResponse.json({ ok: true });
}
