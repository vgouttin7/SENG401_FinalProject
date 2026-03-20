import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id: parseInt(campaignId) },
    include: {
      stages: {
        orderBy: { stageNum: "asc" },
        include: {
          dialogueLines: { orderBy: { sortOrder: "asc" }, include: { character: true } },
          stageEnemies: { include: { enemyTemplate: true } },
          questions: { orderBy: { sortOrder: "asc" } },
          modifierPool: { include: { modifierDef: true } },
        },
      },
      victoryLines: { orderBy: { sortOrder: "asc" }, include: { character: true } },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const playerConfig = await prisma.playerConfig.findFirst({ where: { name: "default" } });
  const tileTypes = await prisma.tileType.findMany({ orderBy: { code: "asc" } });

  const exportData = {
    campaign: {
      name: campaign.name,
      description: campaign.description,
      victoryMusic: campaign.victoryMusic,
      victoryDialogue: campaign.victoryLines.map((vl) => ({
        speaker: vl.character.name,
        speakerColor: vl.character.color,
        portrait: vl.portrait,
        text: vl.text,
      })),
    },
    playerConfig: playerConfig ?? {},
    tileTypes: tileTypes.map((t) => ({ code: t.code, name: t.name, sprite: t.sprite })),
    stages: campaign.stages.map((stage) => ({
      stageNum: stage.stageNum,
      eraName: stage.eraName,
      roundTime: stage.roundTime,
      spawnInterval: stage.spawnInterval,
      background: stage.background,
      requiresStomp: stage.requiresStomp,
      reviveSeconds: stage.reviveSeconds,
      completionMessage: stage.completionMessage,
      retryMessage: stage.retryMessage,
      dialogueMusic: stage.dialogueMusic,
      combatMusic: stage.combatMusic,
      quizMusic: stage.quizMusic,
      tileMap: stage.tileMap,
      enemies: stage.stageEnemies.map((se) => ({
        name: se.enemyTemplate.name,
        displayName: se.enemyTemplate.displayName,
        minSpeed: se.minSpeed,
        maxSpeed: se.maxSpeed,
        hp: se.enemyTemplate.hp,
        speedModifier: se.enemyTemplate.speedModifier,
        spriteWalk: se.enemyTemplate.spriteWalk,
        spriteDead: se.enemyTemplate.spriteDead,
        spriteScale: se.enemyTemplate.spriteScale,
      })),
      dialogue: stage.dialogueLines.map((dl) => ({
        speaker: dl.character.name,
        speakerColor: dl.character.color,
        portrait: dl.portrait,
        text: dl.text,
      })),
      questions: stage.questions.map((q) => ({
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
      modifierPool: stage.modifierPool.map((mp) => ({
        type: mp.modifierDef.type,
        name: mp.modifierDef.name,
        value: mp.modifierDef.value,
        description: mp.modifierDef.description,
        isPositive: mp.modifierDef.isPositive,
      })),
    })),
  };

  // If ?download=true, return as a downloadable file
  const url = new URL(_req.url);
  if (url.searchParams.get("download") === "true") {
    const jsonStr = JSON.stringify(exportData, null, 2);
    return new Response(jsonStr, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="campaign.json"`,
      },
    });
  }

  return NextResponse.json(exportData);
}
