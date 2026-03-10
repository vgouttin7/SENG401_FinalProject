import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lines = await prisma.dialogueLine.findMany({
    where: { stageId: parseInt(id) },
    orderBy: { sortOrder: "asc" },
    include: { character: true },
  });
  return NextResponse.json(lines);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const line = await prisma.dialogueLine.create({
    data: { stageId: parseInt(id), characterId: body.characterId, text: body.text, sortOrder: body.sortOrder ?? 0 },
    include: { character: true },
  });
  return NextResponse.json(line, { status: 201 });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // Reorder: accept array of { id, sortOrder }
  if (Array.isArray(body)) {
    for (const item of body) {
      await prisma.dialogueLine.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } });
    }
    const lines = await prisma.dialogueLine.findMany({
      where: { stageId: parseInt(id) },
      orderBy: { sortOrder: "asc" },
      include: { character: true },
    });
    return NextResponse.json(lines);
  }
  return NextResponse.json({ error: "Expected array for reordering" }, { status: 400 });
}
