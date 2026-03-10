import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pool = await prisma.modifierPool.findMany({
    where: { stageId: parseInt(id) },
    include: { modifierDef: true },
  });
  return NextResponse.json(pool);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const entry = await prisma.modifierPool.create({
    data: { stageId: parseInt(id), modifierDefId: body.modifierDefId },
    include: { modifierDef: true },
  });
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  await prisma.modifierPool.delete({ where: { id: body.modifierPoolId } });
  return NextResponse.json({ ok: true });
}
