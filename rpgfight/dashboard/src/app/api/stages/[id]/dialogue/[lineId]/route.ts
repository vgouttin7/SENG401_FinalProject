import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; lineId: string }> }) {
  const { lineId } = await params;
  const body = await req.json();
  const line = await prisma.dialogueLine.update({
    where: { id: parseInt(lineId) },
    data: body,
    include: { character: true },
  });
  return NextResponse.json(line);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; lineId: string }> }) {
  const { lineId } = await params;
  await prisma.dialogueLine.delete({ where: { id: parseInt(lineId) } });
  return NextResponse.json({ ok: true });
}
