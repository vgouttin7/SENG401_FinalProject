import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const mod = await prisma.modifierDef.update({ where: { id: parseInt(id) }, data: body });
  return NextResponse.json(mod);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.modifierDef.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
