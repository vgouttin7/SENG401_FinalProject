import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const mods = await prisma.modifierDef.findMany({ orderBy: { type: "asc" } });
  return NextResponse.json(mods);
}

export async function POST(req: Request) {
  const body = await req.json();
  const mod = await prisma.modifierDef.create({ data: body });
  return NextResponse.json(mod, { status: 201 });
}
