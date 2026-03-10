import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const stage = await prisma.stage.create({
    data: {
      campaignId: parseInt(id),
      stageNum: body.stageNum,
      eraName: body.eraName,
      roundTime: body.roundTime ?? 45,
      spawnInterval: body.spawnInterval ?? 6,
      background: body.background ?? "",
      requiresStomp: body.requiresStomp ?? false,
      tileMap: body.tileMap ?? [],
    },
  });
  return NextResponse.json(stage, { status: 201 });
}
