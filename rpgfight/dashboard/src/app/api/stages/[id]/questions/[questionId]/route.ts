import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  const { questionId } = await params;
  const body = await req.json();
  const q = await prisma.question.update({ where: { id: parseInt(questionId) }, data: body });
  return NextResponse.json(q);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  const { questionId } = await params;
  await prisma.question.delete({ where: { id: parseInt(questionId) } });
  return NextResponse.json({ ok: true });
}
