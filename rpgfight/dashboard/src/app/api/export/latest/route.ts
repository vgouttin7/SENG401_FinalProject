import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/export/latest
 * Exports the first active campaign. This avoids hardcoding campaign IDs.
 */
export async function GET() {
  const campaign = await prisma.campaign.findFirst({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
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
    },
  });

  if (!campaign) return NextResponse.json({ error: "No active campaign found" }, { status: 404 });

  const playerConfig = await prisma.playerConfig.findFirst({ where: { name: "default" } });
  const tileTypes = await prisma.tileType.findMany({ orderBy: { code: "asc" } });

  const exportData = {
    campaign: {
      name: campaign.name,
      description: campaign.description,
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

  return NextResponse.json(exportData);
}
