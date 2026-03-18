import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

/**
 * POST /api/reset
 * Resets the database to the default seed data by importing the baseline campaign JSON.
 */
export async function POST() {
  try {
    // Load the default campaign JSON
    const defaultPath = path.join(process.cwd(), "prisma", "default-campaign.json");
    if (!fs.existsSync(defaultPath)) {
      return NextResponse.json({ error: "Default campaign file not found" }, { status: 500 });
    }
    const data = JSON.parse(fs.readFileSync(defaultPath, "utf-8"));

    await prisma.$transaction(async (tx) => {
      // 1. Wipe everything
      await tx.dialogueLine.deleteMany();
      await tx.question.deleteMany();
      await tx.modifierPool.deleteMany();
      await tx.stageEnemy.deleteMany();
      await tx.stage.deleteMany();
      await tx.campaign.deleteMany();
      await tx.character.deleteMany();
      await tx.enemyTemplate.deleteMany();
      await tx.modifierDef.deleteMany();

      // 2. Upsert player config
      if (data.playerConfig) {
        const pc = data.playerConfig;
        await tx.playerConfig.upsert({
          where: { name: "default" },
          update: {
            horizontalAcceleration: pc.horizontalAcceleration ?? 2,
            friction: pc.friction ?? 0.15,
            verticalAcceleration: pc.verticalAcceleration ?? 0.8,
            jumpSpeed: pc.jumpSpeed ?? 23,
            startingHealth: pc.startingHealth ?? 100,
            beamVelocity: pc.beamVelocity ?? 20,
            beamRange: pc.beamRange ?? 500,
          },
          create: {
            name: "default",
            horizontalAcceleration: pc.horizontalAcceleration ?? 2,
            friction: pc.friction ?? 0.15,
            verticalAcceleration: pc.verticalAcceleration ?? 0.8,
            jumpSpeed: pc.jumpSpeed ?? 23,
            startingHealth: pc.startingHealth ?? 100,
            beamVelocity: pc.beamVelocity ?? 20,
            beamRange: pc.beamRange ?? 500,
          },
        });
      }

      // 3. Upsert tile types
      if (data.tileTypes) {
        for (const tt of data.tileTypes) {
          await tx.tileType.upsert({
            where: { code: tt.code },
            update: { name: tt.name, sprite: tt.sprite ?? "" },
            create: { code: tt.code, name: tt.name, sprite: tt.sprite ?? "" },
          });
        }
      }

      // 4. Create campaign
      const campaign = await tx.campaign.create({
        data: {
          name: data.campaign.name,
          description: data.campaign.description ?? "",
        },
      });

      // 5. Collect characters and enemies from stage data
      const characterMap = new Map<string, { name: string; color: string }>();
      const enemyTemplateMap = new Map<string, Record<string, unknown>>();

      for (const stage of data.stages) {
        for (const dl of stage.dialogue ?? []) {
          if (!characterMap.has(dl.speaker)) {
            characterMap.set(dl.speaker, { name: dl.speaker, color: dl.speakerColor ?? "#FFFFFF" });
          }
        }
        for (const e of stage.enemies ?? []) {
          if (!enemyTemplateMap.has(e.name)) {
            enemyTemplateMap.set(e.name, {
              name: e.name,
              displayName: e.displayName ?? e.name,
              hp: e.hp ?? 1,
              speedModifier: e.speedModifier ?? 0,
              spriteWalk: e.spriteWalk ?? "",
              spriteDead: e.spriteDead ?? "",
            });
          }
        }
      }

      // 6. Create characters
      const charIdMap = new Map<string, number>();
      for (const [, char] of characterMap) {
        const created = await tx.character.create({ data: char });
        charIdMap.set(char.name, created.id);
      }

      // 7. Create enemy templates
      const enemyIdMap = new Map<string, number>();
      for (const [, et] of enemyTemplateMap) {
        const created = await tx.enemyTemplate.create({
          data: {
            name: et.name as string,
            displayName: et.displayName as string,
            hp: et.hp as number,
            speedModifier: et.speedModifier as number,
            spriteWalk: et.spriteWalk as string,
            spriteDead: et.spriteDead as string,
          },
        });
        enemyIdMap.set(et.name as string, created.id);
      }

      // 8. Create stages with all related data
      for (const stage of data.stages) {
        const createdStage = await tx.stage.create({
          data: {
            campaignId: campaign.id,
            stageNum: stage.stageNum,
            eraName: stage.eraName,
            roundTime: stage.roundTime ?? 45,
            spawnInterval: stage.spawnInterval ?? 6,
            background: stage.background ?? "",
            requiresStomp: stage.requiresStomp ?? false,
            dialogueMusic: stage.dialogueMusic ?? "",
            combatMusic: stage.combatMusic ?? "",
            quizMusic: stage.quizMusic ?? "",
            tileMap: stage.tileMap ?? [],
          },
        });

        // Dialogue lines
        for (let i = 0; i < (stage.dialogue ?? []).length; i++) {
          const dl = stage.dialogue[i];
          const charId = charIdMap.get(dl.speaker);
          if (charId) {
            await tx.dialogueLine.create({
              data: {
                stageId: createdStage.id,
                characterId: charId,
                text: dl.text,
                portrait: dl.portrait ?? "",
                sortOrder: i,
              },
            });
          }
        }

        // Questions
        for (let i = 0; i < (stage.questions ?? []).length; i++) {
          const q = stage.questions[i];
          await tx.question.create({
            data: {
              stageId: createdStage.id,
              text: q.text,
              choices: q.choices,
              correctIndex: q.correctIndex,
              explanation: q.explanation ?? "",
              sortOrder: i,
            },
          });
        }

        // Stage enemies
        for (const e of stage.enemies ?? []) {
          const etId = enemyIdMap.get(e.name);
          if (etId) {
            await tx.stageEnemy.create({
              data: {
                stageId: createdStage.id,
                enemyTemplateId: etId,
                minSpeed: e.minSpeed ?? 1,
                maxSpeed: e.maxSpeed ?? 3,
              },
            });
          }
        }

        // Modifier pool
        for (let i = 0; i < (stage.modifierPool ?? []).length; i++) {
          const mp = stage.modifierPool[i];
          let modDef = await tx.modifierDef.findFirst({
            where: { type: mp.type, name: mp.name },
          });
          if (!modDef) {
            modDef = await tx.modifierDef.create({
              data: {
                type: mp.type,
                name: mp.name,
                value: mp.value ?? 0,
                description: mp.description ?? "",
                isPositive: mp.isPositive ?? true,
              },
            });
          }
          await tx.modifierPool.create({
            data: {
              stageId: createdStage.id,
              modifierDefId: modDef.id,
              sortOrder: i,
            },
          });
        }
      }

      return campaign;
    });

    return NextResponse.json({ success: true, message: "Database reset to defaults" });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { error: "Reset failed: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
