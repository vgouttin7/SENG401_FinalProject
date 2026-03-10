import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const characters = await prisma.character.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(characters);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const character = await prisma.character.create({ data: body });
  return NextResponse.json(character, { status: 201 });
}
