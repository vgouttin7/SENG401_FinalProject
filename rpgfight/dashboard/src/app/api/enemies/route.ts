import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const enemies = await prisma.enemyTemplate.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(enemies);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const enemy = await prisma.enemyTemplate.create({ data: body });
  return NextResponse.json(enemy, { status: 201 });
}
