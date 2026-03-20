import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/export/campaigns
 * Returns all active campaigns with basic info for the game's campaign selection screen.
 */
export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { stages: true },
      },
    },
  });

  const result = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    stageCount: c._count.stages,
  }));

  return NextResponse.json({ campaigns: result });
}
