import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const character = await prisma.character.update({ where: { id: parseInt(id) }, data: body });
  return NextResponse.json(character);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.character.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
