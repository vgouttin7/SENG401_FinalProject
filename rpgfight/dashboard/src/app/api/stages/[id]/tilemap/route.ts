import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stage = await prisma.stage.findUnique({ where: { id: parseInt(id) }, select: { tileMap: true } });
  if (!stage) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(stage.tileMap);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const tileMap = body.tileMap as number[][];

  // Validate: tile map must contain a player spawn (tile 9)
  const hasSpawn = tileMap.some((row: number[]) => row.includes(9));
  if (!hasSpawn) {
    return NextResponse.json(
      { error: "Tile map must contain a player spawn point (tile 9)" },
      { status: 400 }
    );
  }

  const stage = await prisma.stage.update({ where: { id: parseInt(id) }, data: { tileMap } });
  return NextResponse.json(stage.tileMap);
}
