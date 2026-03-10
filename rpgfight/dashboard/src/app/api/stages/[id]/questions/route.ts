import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const questions = await prisma.question.findMany({
    where: { stageId: parseInt(id) },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(questions);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const q = await prisma.question.create({
    data: {
      stageId: parseInt(id),
      text: body.text,
      choices: body.choices,
      correctIndex: body.correctIndex,
      explanation: body.explanation ?? "",
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(q, { status: 201 });
}
