import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stage = await prisma.stage.findUnique({
    where: { id: parseInt(id) },
    include: {
      dialogueLines: { orderBy: { sortOrder: "asc" }, include: { character: true } },
      stageEnemies: { include: { enemyTemplate: true } },
      questions: { orderBy: { sortOrder: "asc" } },
      modifierPool: { include: { modifierDef: true } },
    },
  });
  if (!stage) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(stage);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const stage = await prisma.stage.update({ where: { id: parseInt(id) }, data: body });
  return NextResponse.json(stage);
}
