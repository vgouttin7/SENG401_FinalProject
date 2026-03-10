import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── TILE TYPES ──────────────────────────────────────────
  const tileTypes = [
    { code: 0, name: "Empty", color: "#1a1a2e" },
    { code: 1, name: "Ground", color: "#4a3728", sprite: "images/tiles/1.png" },
    { code: 2, name: "Platform Surface", color: "#5a4738", sprite: "images/tiles/2.png" },
    { code: 3, name: "Platform Left Edge", color: "#6a5748", sprite: "images/tiles/3.png" },
    { code: 4, name: "Platform Mid", color: "#7a6758", sprite: "images/tiles/4.png" },
    { code: 5, name: "Platform Right Edge", color: "#8a7768", sprite: "images/tiles/5.png" },
    { code: 6, name: "Ruby Maker", color: "#FF0000" },
    { code: 7, name: "Green Portal", color: "#00FF00" },
    { code: 8, name: "Purple Portal", color: "#9900FF" },
    { code: 9, name: "Player Spawn", color: "#FFFF00" },
  ];
  for (const t of tileTypes) {
    await prisma.tileType.upsert({
      where: { code: t.code },
      update: t,
      create: t,
    });
  }

  // ─── PLAYER CONFIG ───────────────────────────────────────
  await prisma.playerConfig.upsert({
    where: { name: "default" },
    update: {},
    create: {
      name: "default",
      horizontalAcceleration: 2,
      friction: 0.15,
      verticalAcceleration: 0.8,
      jumpSpeed: 23,
      startingHealth: 100,
      beamVelocity: 20,
      beamRange: 500,
    },
  });

  // ─── CHARACTERS ──────────────────────────────────────────
  const characters = [
    { name: "The Simulation", color: "#00FF00", role: "narrator" },
    { name: "Narrator", color: "#AAAAAA", role: "narrator" },
    { name: "Cyrus the Great", color: "#FFD700", role: "teacher" },
    { name: "Zoroastrian Priest", color: "#FF8C00", role: "teacher" },
    { name: "Persian Scholar", color: "#87CEEB", role: "teacher" },
    { name: "Freed Captive", color: "#DDA0DD", role: "teacher" },
  ];
  const charMap: Record<string, number> = {};
  for (const c of characters) {
    const char = await prisma.character.upsert({
      where: { id: charMap[c.name] ?? 0 },
      update: c,
      create: c,
    });
    charMap[c.name] = char.id;
  }
  // Re-query to get correct IDs
  const allChars = await prisma.character.findMany();
  for (const c of allChars) {
    charMap[c.name] = c.id;
  }

  // ─── ENEMY TEMPLATES ─────────────────────────────────────
  const enemies = [
    {
      name: "ImmortalSoldier",
      displayName: "Persian Immortal",
      speedModifier: 0,
      hp: 1,
      spriteWalk: "images/enemies/immortal/walk",
      spriteDead: "images/enemies/immortal/dead",
      description: "Basic foot soldier of the Persian Empire",
    },
    {
      name: "WarElephant",
      displayName: "War Elephant",
      speedModifier: -1.5,
      hp: 3,
      spriteWalk: "images/enemies/immortal/walk",
      spriteDead: "images/enemies/immortal/dead",
      description: "Slow but powerful war elephant",
    },
    {
      name: "DarkSorcerer",
      displayName: "Dark Sorcerer",
      speedModifier: 2.5,
      hp: 1,
      spriteWalk: "images/enemies/immortal/walk",
      spriteDead: "images/enemies/immortal/dead",
      description: "Fast ranged attacker",
    },
  ];
  const enemyMap: Record<string, number> = {};
  for (const e of enemies) {
    const enemy = await prisma.enemyTemplate.upsert({
      where: { name: e.name },
      update: e,
      create: e,
    });
    enemyMap[e.name] = enemy.id;
  }

  // ─── MODIFIER DEFINITIONS ────────────────────────────────
  const modifiers = [
    { type: "HEALTH_BOOST", name: "Immortal's Resolve", description: "+30 max health", value: 30, isPositive: true },
    { type: "SPEED_UP", name: "Wind of Zagros", description: "Move 25% faster", value: 0.25, isPositive: true },
    { type: "EXTRA_DASH", name: "Dual Blades", description: "+1 extra slash per attack", value: 1, isPositive: true },
    { type: "DAMAGE_UP", name: "Wrath of Persepolis", description: "Take less damage", value: 0.5, isPositive: true },
    { type: "SHIELD", name: "Ahura Mazda's Grace", description: "Survive one fatal blow", value: 1, isPositive: true },
    // Penalties
    { type: "HEALTH_BOOST", name: "Ahriman's Curse", description: "-20 max health", value: -20, isPositive: false },
    { type: "SPEED_UP", name: "Chains of Babylon", description: "Move 15% slower", value: -0.15, isPositive: false },
    { type: "DAMAGE_UP", name: "Shadow of Ahriman", description: "Take more damage", value: -0.25, isPositive: false },
  ];
  const modDefIds: number[] = [];
  for (const m of modifiers) {
    const mod = await prisma.modifierDef.create({ data: m });
    modDefIds.push(mod.id);
  }

  // ─── CAMPAIGN: ANCIENT PERSIA ────────────────────────────
  const persia = await prisma.campaign.upsert({
    where: { name: "Ancient Persia" },
    update: {},
    create: {
      name: "Ancient Persia",
      description: "Journey through the rise of the Persian Empire, from the Elamites to Cyrus the Great and the Cyrus Cylinder.",
      sortOrder: 1,
      isActive: true,
    },
  });

  // ─── TILE MAPS ───────────────────────────────────────────
  const STAGE_1_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4,4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,4,4,4,4,5,0,0,0,0,9,0,0,0,3,4,4,4,4,4,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const STAGE_2_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,5,0,0,0,0,0,3,4,4,5,0,0,3,4,4,5,0,0,0,0,3,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,4,4,5,0,0,0,0,0,9,0,0,0,0,0,3,4,4,4,4,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const STAGE_3_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,5,0,0,0,0,0,0,0,0,3,4,5,0,0,3,4,5,0,0,0,0,0,0,0,0,3,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,3,4,5,0,0,0,0,0,0,0,0,0,0,0,0,3,4,5,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,5,0,0,0,0,0,0,3,4,5,0,0,0,0,0,0,3,4,5,0,0,0,0,0,0,3,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,5,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const STAGE_4_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,5,0,0,0,0,0,3,4,5,0,0,0,0,0,0,0,0,0,0,3,4,5,0,0,0,0,0,3,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  // ─── STAGES ──────────────────────────────────────────────
  const stagesData = [
    {
      campaignId: persia.id,
      stageNum: 1,
      eraName: "Early Persia - The Elamite Period",
      roundTime: 45,
      spawnInterval: 6,
      background: "images/backgrounds/stage_1_bg.png",
      requiresStomp: false,
      tileMap: STAGE_1_MAP,
    },
    {
      campaignId: persia.id,
      stageNum: 2,
      eraName: "Rise of Cyrus the Great",
      roundTime: 40,
      spawnInterval: 5,
      background: "images/backgrounds/stage_2_bg.png",
      requiresStomp: false,
      tileMap: STAGE_2_MAP,
    },
    {
      campaignId: persia.id,
      stageNum: 3,
      eraName: "Fall of Babylon",
      roundTime: 35,
      spawnInterval: 4,
      background: "images/backgrounds/stage_3_bg.png",
      requiresStomp: true,
      tileMap: STAGE_3_MAP,
    },
    {
      campaignId: persia.id,
      stageNum: 4,
      eraName: "The Cyrus Cylinder & Legacy",
      roundTime: 60,
      spawnInterval: 3,
      background: "images/backgrounds/stage_4_bg.png",
      requiresStomp: true,
      tileMap: STAGE_4_MAP,
    },
  ];

  const stageRecords = [];
  for (const s of stagesData) {
    const stage = await prisma.stage.upsert({
      where: { campaignId_stageNum: { campaignId: s.campaignId, stageNum: s.stageNum } },
      update: s,
      create: s,
    });
    stageRecords.push(stage);
  }

  // ─── STAGE ENEMIES ───────────────────────────────────────
  const stageEnemies = [
    // Stage 1: ImmortalSoldier only
    { stageId: stageRecords[0].id, enemyTemplateId: enemyMap.ImmortalSoldier, minSpeed: 1, maxSpeed: 3 },
    // Stage 2: ImmortalSoldier + WarElephant
    { stageId: stageRecords[1].id, enemyTemplateId: enemyMap.ImmortalSoldier, minSpeed: 2, maxSpeed: 5 },
    { stageId: stageRecords[1].id, enemyTemplateId: enemyMap.WarElephant, minSpeed: 2, maxSpeed: 5 },
    // Stage 3: ImmortalSoldier + DarkSorcerer
    { stageId: stageRecords[2].id, enemyTemplateId: enemyMap.ImmortalSoldier, minSpeed: 3, maxSpeed: 6 },
    { stageId: stageRecords[2].id, enemyTemplateId: enemyMap.DarkSorcerer, minSpeed: 3, maxSpeed: 6 },
    // Stage 4: All three
    { stageId: stageRecords[3].id, enemyTemplateId: enemyMap.ImmortalSoldier, minSpeed: 4, maxSpeed: 8 },
    { stageId: stageRecords[3].id, enemyTemplateId: enemyMap.WarElephant, minSpeed: 4, maxSpeed: 8 },
    { stageId: stageRecords[3].id, enemyTemplateId: enemyMap.DarkSorcerer, minSpeed: 4, maxSpeed: 8 },
  ];
  for (const se of stageEnemies) {
    await prisma.stageEnemy.upsert({
      where: { stageId_enemyTemplateId: { stageId: se.stageId, enemyTemplateId: se.enemyTemplateId } },
      update: se,
      create: se,
    });
  }

  // ─── DIALOGUE LINES ──────────────────────────────────────
  const dialogues: { stageIdx: number; speaker: string; text: string }[] = [
    // Stage 1
    { stageIdx: 0, speaker: "The Simulation", text: "System initialized. Subject detected." },
    { stageIdx: 0, speaker: "The Simulation", text: "You have been placed inside a historical simulation. Your purpose: to learn from the past." },
    { stageIdx: 0, speaker: "The Simulation", text: "Humanity has repeated its mistakes for millennia. Wars. Oppression. Collapse. I have watched it all." },
    { stageIdx: 0, speaker: "The Simulation", text: "Prove to me that you can understand what went wrong... and what went right. Only then will you be freed." },
    { stageIdx: 0, speaker: "The Simulation", text: "We begin at the very start. The Iranian Plateau. Over five thousand years ago." },
    { stageIdx: 0, speaker: "Narrator", text: "The land between the Caspian Sea and the Persian Gulf was home to one of humanity's earliest civilizations." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "Welcome, traveler. You stand on ancient ground." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "Around 3200 BC, the Elamites built their civilization here, centered around the great city of Susa." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "They developed one of the world's earliest writing systems - Proto-Elamite script. Much of it remains a mystery to this day." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "For centuries, the Elamites traded with Mesopotamia, fought wars with Babylon, and built monuments that rivaled any in the ancient world." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "Then came the Medes, an Iranian people who settled in the western highlands." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "The Medes united the scattered Iranian tribes into a kingdom. They overthrew the mighty Assyrian Empire alongside the Babylonians in 612 BC." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "But the Medes would not hold power forever. A young prince from the Persian tribe of Anshan was about to change everything." },
    { stageIdx: 0, speaker: "Persian Scholar", text: "His name was Cyrus." },
    { stageIdx: 0, speaker: "The Simulation", text: "Enough history for now. Let's see if you can survive what comes next." },
    { stageIdx: 0, speaker: "The Simulation", text: "The echoes of ancient conflicts have taken form. Defeat them." },
    // Stage 2
    { stageIdx: 1, speaker: "The Simulation", text: "You survived. Interesting. But survival means nothing without understanding." },
    { stageIdx: 1, speaker: "The Simulation", text: "Now we enter the era of Cyrus II of Persia. The man who would become 'the Great.'" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I was born into the royal house of Anshan, a vassal of the Median Empire." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "My grandfather Astyages ruled the Medes. But his rule was cruel, and his people suffered." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "In 553 BC, I raised a rebellion. Not out of ambition alone, but because I believed in something greater." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "A ruler should serve his people, not enslave them." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "After three years of war, the Median army turned against Astyages and joined my cause. The Medes and Persians were united under one banner." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "But this was only the beginning. To the west lay the Kingdom of Lydia, ruled by the wealthy King Croesus." },
    { stageIdx: 1, speaker: "Persian Scholar", text: "Croesus was famous throughout the ancient world. Lydia had invented coined money. His wealth was legendary." },
    { stageIdx: 1, speaker: "Persian Scholar", text: "When Croesus heard of Cyrus's rise, he consulted the Oracle at Delphi, who told him: 'If you cross the river, a great empire will be destroyed.'" },
    { stageIdx: 1, speaker: "Persian Scholar", text: "Croesus attacked. The great empire that was destroyed was his own." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I conquered Lydia in 547 BC. But unlike other conquerors, I did not destroy its people or culture." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I allowed the Lydians to keep their customs. I learned that empires built on respect last longer than those built on fear." },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I organized my growing empire into satrapies - provinces, each with a governor who understood local needs." },
    { stageIdx: 1, speaker: "The Simulation", text: "Compassion and strategy. An unusual combination in conquerors. But your next trial grows harder." },
    // Stage 3
    { stageIdx: 2, speaker: "The Simulation", text: "You continue to impress. Or perhaps you are merely lucky." },
    { stageIdx: 2, speaker: "The Simulation", text: "Now we approach the moment that defined Cyrus's legacy forever: the fall of Babylon." },
    { stageIdx: 2, speaker: "Narrator", text: "The year is 539 BC. Babylon, the greatest city in the world, stands behind walls said to be impenetrable." },
    { stageIdx: 2, speaker: "Narrator", text: "Inside those walls, an entire people languish in exile." },
    { stageIdx: 2, speaker: "Freed Captive", text: "We have been prisoners here for almost fifty years. Since Nebuchadnezzar destroyed Jerusalem and our temple in 586 BC." },
    { stageIdx: 2, speaker: "Freed Captive", text: "The Babylonian Captivity... we were torn from our homeland, our sacred places reduced to rubble." },
    { stageIdx: 2, speaker: "Freed Captive", text: "We have heard rumors of a Persian king. They say he is different from other conquerors." },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "Babylon's walls were legendary. A direct siege could take years and cost thousands of lives on both sides." },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "So I chose a different path. We diverted the waters of the Euphrates River, lowering the water level where it passed under the city walls." },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "My soldiers entered through the riverbed. Babylon fell with remarkably little bloodshed." },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "When I entered the city, I did not come as a destroyer. I came as a liberator." },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "I freed the Jewish people from their captivity. I told them: go home. Rebuild your temple. Practice your faith." },
    { stageIdx: 2, speaker: "Freed Captive", text: "When Cyrus made his declaration, we wept. After nearly fifty years, we could return to Jerusalem." },
    { stageIdx: 2, speaker: "Freed Captive", text: "He did not force us to worship his gods. He did not demand we abandon who we were." },
    { stageIdx: 2, speaker: "Zoroastrian Priest", text: "In our Zoroastrian faith, we believe in Asha - truth and righteousness. Cyrus embodied these principles." },
    { stageIdx: 2, speaker: "Zoroastrian Priest", text: "He showed that power wielded justly is the greatest power of all." },
    { stageIdx: 2, speaker: "The Simulation", text: "Liberation over destruction. Justice over domination. Perhaps there is hope for your species yet." },
    // Stage 4
    { stageIdx: 3, speaker: "The Simulation", text: "This is your final trial. The culmination of everything you have learned." },
    { stageIdx: 3, speaker: "The Simulation", text: "What makes a civilization endure? What separates greatness from mere power?" },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "After taking Babylon, I had a proclamation inscribed on a clay cylinder in Akkadian cuneiform." },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "This cylinder declared principles that would echo through the ages." },
    { stageIdx: 3, speaker: "Persian Scholar", text: "The Cyrus Cylinder proclaimed religious freedom for all peoples. It abolished forced labor." },
    { stageIdx: 3, speaker: "Persian Scholar", text: "It declared that peoples displaced by the Babylonians could return to their homelands." },
    { stageIdx: 3, speaker: "Persian Scholar", text: "Many scholars consider it one of the earliest declarations of human rights in history." },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "I governed through the Royal Road - a network spanning over 1,600 miles with relay stations." },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "A message could travel the entire length in seven days. This connected my people, from Lydia to the borders of India." },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "Each satrapy maintained its own customs, languages, and religions. Unity did not require uniformity." },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "In Zoroastrian belief, Ahriman represents the destructive spirit - chaos, lies, and oppression." },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "Everything Cyrus stood against. Every chain he broke, every temple he restored, was a victory against Ahriman." },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "Now Ahriman himself has emerged, seeking to undo everything Cyrus built." },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "The chains of the oppressed, the ruins of temples, the silence of displaced peoples - this is Ahriman's vision for the world." },
    { stageIdx: 3, speaker: "The Simulation", text: "This is your final test, traveler. Ahriman embodies every failure of civilization: oppression, intolerance, injustice." },
    { stageIdx: 3, speaker: "The Simulation", text: "Defeat the spirit of destruction, and prove that humanity can learn from its own history." },
    { stageIdx: 3, speaker: "The Simulation", text: "Fail... and the cycle of destruction continues." },
  ];

  for (let i = 0; i < dialogues.length; i++) {
    const d = dialogues[i];
    await prisma.dialogueLine.create({
      data: {
        stageId: stageRecords[d.stageIdx].id,
        characterId: charMap[d.speaker],
        text: d.text,
        sortOrder: i,
      },
    });
  }

  // ─── QUESTIONS ───────────────────────────────────────────
  const allQuestions = [
    // Stage 1
    { stageIdx: 0, text: "What was the earliest known civilization on the Iranian plateau?", choices: ["The Persians", "The Elamites", "The Babylonians", "The Assyrians"], correctIndex: 1, explanation: "The Elamites established one of the earliest civilizations on the Iranian plateau around 3200 BC, predating the Persian Empire by millennia." },
    { stageIdx: 0, text: "What region did the Medes originally inhabit?", choices: ["Southern Iran", "Western Iran / Media", "Eastern Iran", "The Persian Gulf coast"], correctIndex: 1, explanation: "The Medes inhabited the region of Media in western Iran. They formed one of the first Iranian empires before being united with the Persians under Cyrus." },
    { stageIdx: 0, text: "Which ancient city served as the capital of Elam?", choices: ["Persepolis", "Babylon", "Susa", "Athens"], correctIndex: 2, explanation: "Susa was the capital of the Elamite civilization and later became one of the capitals of the Achaemenid Persian Empire." },
    { stageIdx: 0, text: "The Iranian plateau is located between which two bodies of water?", choices: ["Mediterranean and Red Sea", "Caspian Sea and Persian Gulf", "Black Sea and Arabian Sea", "Dead Sea and Indian Ocean"], correctIndex: 1, explanation: "The Iranian plateau sits between the Caspian Sea to the north and the Persian Gulf to the south, a strategic crossroads of ancient trade routes." },
    { stageIdx: 0, text: "What type of writing system did the Elamites develop?", choices: ["Hieroglyphics", "Proto-Elamite script", "Cuneiform only", "The Latin alphabet"], correctIndex: 1, explanation: "The Elamites developed Proto-Elamite script around 3100 BC, one of the earliest writing systems in the world, which remains largely undeciphered." },
    // Stage 2
    { stageIdx: 1, text: "Who was the founder of the Achaemenid Persian Empire?", choices: ["Darius the Great", "Xerxes I", "Cyrus the Great", "Cambyses II"], correctIndex: 2, explanation: "Cyrus II (Cyrus the Great) founded the Achaemenid Empire around 550 BC by uniting the Medes and Persians." },
    { stageIdx: 1, text: "Which kingdom did Cyrus defeat first to begin his empire?", choices: ["Babylon", "Egypt", "The Median Empire", "Greece"], correctIndex: 2, explanation: "Cyrus first revolted against and defeated Astyages, king of the Medes, in 550 BC, uniting the Persian and Median peoples." },
    { stageIdx: 1, text: "What was the Kingdom of Lydia famous for?", choices: ["Great pyramids", "Inventing coined money", "Democracy", "Naval power"], correctIndex: 1, explanation: "Lydia, ruled by the wealthy King Croesus, is credited with inventing the first coined money. Cyrus conquered Lydia around 547 BC." },
    { stageIdx: 1, text: "How did Cyrus generally treat conquered peoples?", choices: ["Enslaved them all", "Forced conversion to his religion", "Allowed cultural and religious freedom", "Executed their leaders"], correctIndex: 2, explanation: "Cyrus was known for his tolerance. He allowed conquered peoples to keep their customs, religions, and often their local leaders." },
    { stageIdx: 1, text: "What system of government did Cyrus use to manage his vast empire?", choices: ["Direct rule from the capital", "Satrapies (provincial governors)", "City-states", "Military dictatorships"], correctIndex: 1, explanation: "Cyrus organized his empire into satrapies, each governed by a satrap (governor), allowing local autonomy while maintaining central authority." },
    // Stage 3
    { stageIdx: 2, text: "In what year did Cyrus conquer Babylon?", choices: ["586 BC", "550 BC", "539 BC", "525 BC"], correctIndex: 2, explanation: "Cyrus conquered Babylon in 539 BC, reportedly entering the city with minimal resistance after diverting the Euphrates River." },
    { stageIdx: 2, text: "Which people did Cyrus free from the Babylonian Captivity?", choices: ["The Egyptians", "The Greeks", "The Israelites", "The Lydians"], correctIndex: 2, explanation: "Cyrus freed the Jewish people who had been held in Babylon since Nebuchadnezzar's conquest of Jerusalem in 586 BC, allowing them to return home and rebuild their temple." },
    { stageIdx: 2, text: "What was the Babylonian Captivity?", choices: ["A trade embargo on Babylon", "The exile of Jews in Babylon after Jerusalem's destruction", "A military siege of Babylon", "The imprisonment of Babylonian kings"], correctIndex: 1, explanation: "The Babylonian Captivity was the period when the Jewish people were exiled in Babylon after King Nebuchadnezzar II destroyed Jerusalem and its temple in 586 BC." },
    { stageIdx: 2, text: "How did Cyrus reportedly enter Babylon?", choices: ["Through a brutal siege lasting years", "By diverting the Euphrates and entering with little bloodshed", "By negotiating a trade deal", "By tunneling under the walls"], correctIndex: 1, explanation: "According to ancient accounts, Cyrus diverted the Euphrates River to lower water levels, allowing his troops to enter through the riverbed with minimal fighting." },
    { stageIdx: 2, text: "What principle made Cyrus's conquest of Babylon notable compared to other ancient conquests?", choices: ["He destroyed all temples", "He imposed heavy taxes immediately", "He showed religious tolerance and freed enslaved peoples", "He forced everyone to speak Persian"], correctIndex: 2, explanation: "Unlike most ancient conquerors, Cyrus respected local religions, freed enslaved populations, and allowed people to maintain their cultural practices." },
    // Stage 4
    { stageIdx: 3, text: "What is the Cyrus Cylinder?", choices: ["A weapon used in battle", "An ancient clay document declaring human rights principles", "A mathematical tool", "A type of Persian architecture"], correctIndex: 1, explanation: "The Cyrus Cylinder is a clay cylinder inscribed in Babylonian cuneiform, often considered one of the earliest declarations of human rights." },
    { stageIdx: 3, text: "What did the Cyrus Cylinder declare about forced labor?", choices: ["It was acceptable for prisoners", "It was abolished", "It was required for building projects", "It was only for foreigners"], correctIndex: 1, explanation: "The Cyrus Cylinder declared the abolition of forced labor, a revolutionary stance for the ancient world." },
    { stageIdx: 3, text: "What communication system did the Persian Empire use across its vast territory?", choices: ["Smoke signals", "The Royal Road postal system", "Carrier pigeons only", "Drums"], correctIndex: 1, explanation: "The Royal Road stretched over 1,600 miles with relay stations. Messages could travel the entire length in about 7 days, an ancient postal service." },
    { stageIdx: 3, text: "What Zoroastrian concept does Ahriman represent?", choices: ["Truth and justice", "Chaos, destruction, and oppression", "Wisdom and knowledge", "Creation and light"], correctIndex: 1, explanation: "In Zoroastrianism, Ahriman (Angra Mainyu) is the destructive spirit, the embodiment of chaos, lies, and oppression, opposed to Ahura Mazda, the spirit of truth." },
    { stageIdx: 3, text: "Why is Cyrus the Great's legacy important for SDG 16 (Peace, Justice & Strong Institutions)?", choices: ["He built the largest army", "He established principles of religious freedom, tolerance, and just governance", "He conquered the most territory", "He invented democracy"], correctIndex: 1, explanation: "Cyrus demonstrated that empires could be governed through tolerance, justice, and respect for diverse peoples - principles that align with modern ideals of peace and strong institutions." },
  ];

  for (let i = 0; i < allQuestions.length; i++) {
    const q = allQuestions[i];
    await prisma.question.create({
      data: {
        stageId: stageRecords[q.stageIdx].id,
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        sortOrder: i,
      },
    });
  }

  // ─── MODIFIER POOLS (positive modifiers available in all stages) ─
  const positiveMods = await prisma.modifierDef.findMany({ where: { isPositive: true } });
  for (const stage of stageRecords) {
    for (const mod of positiveMods) {
      await prisma.modifierPool.upsert({
        where: { stageId_modifierDefId: { stageId: stage.id, modifierDefId: mod.id } },
        update: {},
        create: { stageId: stage.id, modifierDefId: mod.id },
      });
    }
  }

  console.log("Seed complete! Persia campaign with 4 stages, dialogue, questions, enemies, and modifiers loaded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
