import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lines = await prisma.victoryLine.findMany({
    where: { campaignId: parseInt(id) },
    orderBy: { sortOrder: "asc" },
    include: { character: true },
  });
  return NextResponse.json(lines);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const maxSort = await prisma.victoryLine.aggregate({
    where: { campaignId: parseInt(id) },
    _max: { sortOrder: true },
  });

  const line = await prisma.victoryLine.create({
    data: {
      campaignId: parseInt(id),
      characterId: body.characterId,
      text: body.text,
      portrait: body.portrait ?? "",
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
    include: { character: true },
  });
  return NextResponse.json(line, { status: 201 });
}

export async function PUT(req: Request) {
  const body = await req.json();

  // Bulk reorder: expects { lines: [{ id, sortOrder, text?, portrait?, characterId? }] }
  if (body.lines) {
    for (const l of body.lines) {
      await prisma.victoryLine.update({
        where: { id: l.id },
        data: {
          sortOrder: l.sortOrder,
          ...(l.text !== undefined && { text: l.text }),
          ...(l.portrait !== undefined && { portrait: l.portrait }),
          ...(l.characterId !== undefined && { characterId: l.characterId }),
        },
      });
    }
    return NextResponse.json({ ok: true });
  }

  // Single update
  const line = await prisma.victoryLine.update({
    where: { id: body.id },
    data: {
      text: body.text,
      portrait: body.portrait ?? "",
      characterId: body.characterId,
    },
    include: { character: true },
  });
  return NextResponse.json(line);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const lineId = searchParams.get("lineId");
  if (!lineId) return NextResponse.json({ error: "lineId required" }, { status: 400 });
  await prisma.victoryLine.delete({ where: { id: parseInt(lineId) } });
  return NextResponse.json({ ok: true });
}
