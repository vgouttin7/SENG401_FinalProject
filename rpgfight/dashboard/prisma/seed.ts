import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── CLEAN UP ──────────────────────────────────────────
  // Delete in dependency order to avoid FK constraint issues
  await prisma.victoryLine.deleteMany();
  await prisma.dialogueLine.deleteMany();
  await prisma.question.deleteMany();
  await prisma.modifierPool.deleteMany();
  await prisma.stageEnemy.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.character.deleteMany();
  await prisma.enemyTemplate.deleteMany();
  await prisma.modifierDef.deleteMany();

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
    { name: "The Simulation", color: "#00FF00", role: "antagonist", portrait: "images/simulation/simulation neutral1.jpg" },
    { name: "Narrator", color: "#AAAAAA", role: "narrator", portrait: "images/narrator/narrator mouth1.jpg" },
    { name: "Cyrus the Great", color: "#FFD700", role: "teacher", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { name: "Zoroastrian Priest", color: "#FF8C00", role: "teacher", portrait: "images/priest/priest smile4.jpg" },
    { name: "Persian Scholar", color: "#87CEEB", role: "teacher", portrait: "images/scholar/scholar smile7.jpg" },
    { name: "Freed Captive", color: "#DDA0DD", role: "teacher", portrait: "images/captive/captive neutral3.jpg" },
    // Ancient Greece characters
    { name: "Socrates", color: "#E0B0FF", role: "teacher", portrait: "images/socrates/socrates neutral1.jpg" },
    { name: "Pericles", color: "#4169E1", role: "teacher", portrait: "images/pericles/pericles neutral1.jpg" },
    { name: "Greek Scholar", color: "#20B2AA", role: "teacher", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { name: "Leonidas", color: "#DC143C", role: "teacher", portrait: "images/leonidas/leonidas neutral1.jpg" },
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
      spriteWalk: "images/sprites/knight_01",
      spriteDead: "",
      spriteScale: 1.0,
      description: "Basic foot soldier of the Persian Empire",
    },
    {
      name: "WarElephant",
      displayName: "War Elephant",
      speedModifier: -1.5,
      hp: 3,
      spriteWalk: "images/sprites/knight_02",
      spriteDead: "",
      spriteScale: 1.0,
      description: "Slow but powerful war elephant",
    },
    {
      name: "DarkSorcerer",
      displayName: "Dark Sorcerer",
      speedModifier: 2.5,
      hp: 1,
      spriteWalk: "images/sprites/knight_03",
      spriteDead: "",
      spriteScale: 1.0,
      description: "Fast ranged attacker",
    },
    // Ancient Greece enemies
    {
      name: "Hoplite",
      displayName: "Greek Hoplite",
      speedModifier: 0,
      hp: 1,
      spriteWalk: "images/sprites/knight_01",
      spriteDead: "",
      spriteScale: 1.0,
      description: "Armored Greek infantry soldier",
    },
    {
      name: "Minotaur",
      displayName: "Minotaur",
      speedModifier: -1.5,
      hp: 3,
      spriteWalk: "images/sprites/knight_02",
      spriteDead: "",
      spriteScale: 1.0,
      description: "Slow but powerful mythological beast",
    },
    {
      name: "Gorgon",
      displayName: "Gorgon",
      speedModifier: 2.5,
      hp: 1,
      spriteWalk: "images/sprites/knight_03",
      spriteDead: "",
      spriteScale: 1.0,
      description: "Fast mythological creature with a deadly gaze",
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
      victoryMusic: "audio/victory_background_music.mp3",
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
      completionMessage: "You survived the Elamite Period!",
      retryMessage: "You have fallen. But history gives second chances to those who seek them.",
      dialogueMusic: "audio/story1_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
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
      completionMessage: "You conquered alongside Cyrus!",
      retryMessage: "Cyrus faced defeat before his greatest victories. Will you rise again?",
      dialogueMusic: "audio/story2_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
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
      completionMessage: "Babylon has fallen!",
      retryMessage: "The walls of Babylon did not fall on the first attempt. Try again.",
      dialogueMusic: "audio/story3_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
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
      completionMessage: "You have defeated the forces of darkness!",
      retryMessage: "Ahriman is relentless, but so is the spirit of justice. Rise again.",
      dialogueMusic: "audio/story4_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
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
  // Portrait paths mapped from the hardcoded dialogue_scripts.rpy show commands.
  // Empty string means "keep the current portrait" (no change from previous line).
  const dialogues: { stageIdx: number; speaker: string; text: string; portrait: string }[] = [
    // ── Stage 1: Early Persia / Elamite Period ──
    { stageIdx: 0, speaker: "The Simulation", text: "System initialized. Subject detected.", portrait: "" },
    { stageIdx: 0, speaker: "The Simulation", text: "You have been placed inside a historical simulation. Your purpose: to learn from the past.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 0, speaker: "The Simulation", text: "Humanity has repeated its mistakes for millennia. Wars. Oppression. Collapse. I have watched it all.", portrait: "images/simulation/simulation angry1.jpg" },
    { stageIdx: 0, speaker: "The Simulation", text: "Prove to me that you can understand what went wrong... and what went right. Only then will you be freed.", portrait: "" },
    { stageIdx: 0, speaker: "The Simulation", text: "We begin at the very start. The Iranian Plateau. Over five thousand years ago.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 0, speaker: "Narrator", text: "The land between the Caspian Sea and the Persian Gulf was home to one of humanity's earliest civilizations.", portrait: "images/narrator/narrator mouth1.jpg" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "Welcome, traveler. You stand on ancient ground.", portrait: "images/scholar/scholar smile7.jpg" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "Around 3200 BC, the Elamites built their civilization here, centered around the great city of Susa.", portrait: "images/scholar/scholar smile6.jpg" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "They developed one of the world's earliest writing systems - Proto-Elamite script. Much of it remains a mystery to this day.", portrait: "" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "For centuries, the Elamites traded with Mesopotamia, fought wars with Babylon, and built monuments that rivaled any in the ancient world.", portrait: "images/scholar/scholar smile7.jpg" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "Then came the Medes, an Iranian people who settled in the western highlands.", portrait: "" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "The Medes united the scattered Iranian tribes into a kingdom. They overthrew the mighty Assyrian Empire alongside the Babylonians in 612 BC.", portrait: "images/scholar/scholar point1.jpg" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "But the Medes would not hold power forever. A young prince from the Persian tribe of Anshan was about to change everything.", portrait: "" },
    { stageIdx: 0, speaker: "Persian Scholar", text: "His name was Cyrus.", portrait: "" },
    { stageIdx: 0, speaker: "The Simulation", text: "Enough history for now. Let's see if you can survive what comes next.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 0, speaker: "The Simulation", text: "The echoes of ancient conflicts have taken form. Defeat them.", portrait: "images/simulation/simulation angry1.jpg" },
    // ── Stage 2: Rise of Cyrus the Great ──
    { stageIdx: 1, speaker: "The Simulation", text: "You survived. Interesting. But survival means nothing without understanding.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 1, speaker: "The Simulation", text: "Now we enter the era of Cyrus II of Persia. The man who would become 'the Great.'", portrait: "" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I was born into the royal house of Anshan, a vassal of the Median Empire.", portrait: "images/cyrus/cyrus proud2.jpg" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "My grandfather Astyages ruled the Medes. But his rule was cruel, and his people suffered.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "In 553 BC, I raised a rebellion. Not out of ambition alone, but because I believed in something greater.", portrait: "" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "A ruler should serve his people, not enslave them.", portrait: "images/cyrus/cyrus angry2.jpg" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "After three years of war, the Median army turned against Astyages and joined my cause. The Medes and Persians were united under one banner.", portrait: "images/cyrus/cyrus point3.jpg" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "But this was only the beginning. To the west lay the Kingdom of Lydia, ruled by the wealthy King Croesus.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 1, speaker: "Persian Scholar", text: "Croesus was famous throughout the ancient world. Lydia had invented coined money. His wealth was legendary.", portrait: "images/scholar/scholar point1.jpg" },
    { stageIdx: 1, speaker: "Persian Scholar", text: "When Croesus heard of Cyrus's rise, he consulted the Oracle at Delphi, who told him: 'If you cross the river, a great empire will be destroyed.'", portrait: "images/scholar/scholar smile6.jpg" },
    { stageIdx: 1, speaker: "Persian Scholar", text: "Croesus attacked. The great empire that was destroyed was his own.", portrait: "images/scholar/scholar smile7.jpg" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I conquered Lydia in 547 BC. But unlike other conquerors, I did not destroy its people or culture.", portrait: "images/cyrus/cyrus point3.jpg" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I allowed the Lydians to keep their customs. I learned that empires built on respect last longer than those built on fear.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 1, speaker: "Cyrus the Great", text: "I organized my growing empire into satrapies - provinces, each with a governor who understood local needs.", portrait: "images/cyrus/cyrus proud2.jpg" },
    { stageIdx: 1, speaker: "The Simulation", text: "Compassion and strategy. An unusual combination in conquerors. But your next trial grows harder.", portrait: "images/simulation/simulation angry1.jpg" },
    // ── Stage 3: Fall of Babylon ──
    { stageIdx: 2, speaker: "The Simulation", text: "You continue to impress. Or perhaps you are merely lucky.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 2, speaker: "The Simulation", text: "Now we approach the moment that defined Cyrus's legacy forever: the fall of Babylon.", portrait: "" },
    { stageIdx: 2, speaker: "Narrator", text: "The year is 539 BC. Babylon, the greatest city in the world, stands behind walls said to be impenetrable.", portrait: "images/narrator/narrator mouth1.jpg" },
    { stageIdx: 2, speaker: "Narrator", text: "Inside those walls, an entire people languish in exile.", portrait: "" },
    { stageIdx: 2, speaker: "Freed Captive", text: "We have been prisoners here for almost fifty years. Since Nebuchadnezzar destroyed Jerusalem and our temple in 586 BC.", portrait: "images/captive/captive sad.jpg" },
    { stageIdx: 2, speaker: "Freed Captive", text: "The Babylonian Captivity... we were torn from our homeland, our sacred places reduced to rubble.", portrait: "" },
    { stageIdx: 2, speaker: "Freed Captive", text: "We have heard rumors of a Persian king. They say he is different from other conquerors.", portrait: "images/captive/captive neutral3.jpg" },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "Babylon's walls were legendary. A direct siege could take years and cost thousands of lives on both sides.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "So I chose a different path. We diverted the waters of the Euphrates River, lowering the water level where it passed under the city walls.", portrait: "images/cyrus/cyrus point3.jpg" },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "My soldiers entered through the riverbed. Babylon fell with remarkably little bloodshed.", portrait: "" },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "When I entered the city, I did not come as a destroyer. I came as a liberator.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 2, speaker: "Cyrus the Great", text: "I freed the Jewish people from their captivity. I told them: go home. Rebuild your temple. Practice your faith.", portrait: "images/cyrus/cyrus proud2.jpg" },
    { stageIdx: 2, speaker: "Freed Captive", text: "When Cyrus made his declaration, we wept. After nearly fifty years, we could return to Jerusalem.", portrait: "images/captive/captive sad.jpg" },
    { stageIdx: 2, speaker: "Freed Captive", text: "He did not force us to worship his gods. He did not demand we abandon who we were.", portrait: "images/captive/captive neutral3.jpg" },
    { stageIdx: 2, speaker: "Zoroastrian Priest", text: "In our Zoroastrian faith, we believe in Asha - truth and righteousness. Cyrus embodied these principles.", portrait: "images/priest/priest smile4.jpg" },
    { stageIdx: 2, speaker: "Zoroastrian Priest", text: "He showed that power wielded justly is the greatest power of all.", portrait: "" },
    { stageIdx: 2, speaker: "The Simulation", text: "Liberation over destruction. Justice over domination. Perhaps there is hope for your species yet.", portrait: "images/simulation/simulation neutral1.jpg" },
    // ── Stage 4: The Cyrus Cylinder & Legacy ──
    { stageIdx: 3, speaker: "The Simulation", text: "This is your final trial. The culmination of everything you have learned.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 3, speaker: "The Simulation", text: "What makes a civilization endure? What separates greatness from mere power?", portrait: "" },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "After taking Babylon, I had a proclamation inscribed on a clay cylinder in Akkadian cuneiform.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "This cylinder declared principles that would echo through the ages.", portrait: "images/cyrus/cyrus point3.jpg" },
    { stageIdx: 3, speaker: "Persian Scholar", text: "The Cyrus Cylinder proclaimed religious freedom for all peoples. It abolished forced labor.", portrait: "images/scholar/scholar smile6.jpg" },
    { stageIdx: 3, speaker: "Persian Scholar", text: "It declared that peoples displaced by the Babylonians could return to their homelands.", portrait: "" },
    { stageIdx: 3, speaker: "Persian Scholar", text: "Many scholars consider it one of the earliest declarations of human rights in history.", portrait: "images/scholar/scholar point1.jpg" },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "I governed through the Royal Road - a network spanning over 1,600 miles with relay stations.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "A message could travel the entire length in seven days. This connected my people, from Lydia to the borders of India.", portrait: "images/cyrus/cyrus point3.jpg" },
    { stageIdx: 3, speaker: "Cyrus the Great", text: "Each satrapy maintained its own customs, languages, and religions. Unity did not require uniformity.", portrait: "images/cyrus/cyrus neutral2.jpg" },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "In Zoroastrian belief, Ahriman represents the destructive spirit - chaos, lies, and oppression.", portrait: "images/priest/priest smile4.jpg" },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "Everything Cyrus stood against. Every chain he broke, every temple he restored, was a victory against Ahriman.", portrait: "" },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "Now Ahriman himself has emerged, seeking to undo everything Cyrus built.", portrait: "" },
    { stageIdx: 3, speaker: "Zoroastrian Priest", text: "The chains of the oppressed, the ruins of temples, the silence of displaced peoples - this is Ahriman's vision for the world.", portrait: "" },
    { stageIdx: 3, speaker: "The Simulation", text: "This is your final test, traveler. Ahriman embodies every failure of civilization: oppression, intolerance, injustice.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 3, speaker: "The Simulation", text: "Defeat the spirit of destruction, and prove that humanity can learn from its own history.", portrait: "" },
    { stageIdx: 3, speaker: "The Simulation", text: "Fail... and the cycle of destruction continues.", portrait: "images/simulation/simulation angry1.jpg" },
  ];

  for (let i = 0; i < dialogues.length; i++) {
    const d = dialogues[i];
    await prisma.dialogueLine.create({
      data: {
        stageId: stageRecords[d.stageIdx].id,
        characterId: charMap[d.speaker],
        text: d.text,
        portrait: d.portrait,
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

  // ─── VICTORY DIALOGUE ────────────────────────────────────
  const victoryLines = [
    { speaker: "The Simulation", text: "Well done, traveler. You have navigated the trials of history and emerged victorious.", portrait: "images/simulation/simulation neutral1.jpg" },
    { speaker: "The Simulation", text: "You have understood what most of humanity refuses to learn.", portrait: "" },
    { speaker: "The Simulation", text: "That power without justice is tyranny. That conquest without compassion is destruction.", portrait: "images/simulation/simulation angry1.jpg" },
    { speaker: "The Simulation", text: "Cyrus showed the world a different path. Freedom over chains. Tolerance over forced conformity.", portrait: "images/simulation/simulation neutral1.jpg" },
    { speaker: "The Simulation", text: "The Cyrus Cylinder remains a testament - not just to one man, but to the possibility of human progress.", portrait: "" },
    { speaker: "The Simulation", text: "You are free, traveler. Carry these lessons forward.", portrait: "" },
  ];

  for (let i = 0; i < victoryLines.length; i++) {
    const vl = victoryLines[i];
    await prisma.victoryLine.create({
      data: {
        campaignId: persia.id,
        characterId: charMap[vl.speaker],
        text: vl.text,
        portrait: vl.portrait,
        sortOrder: i,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // ─── CAMPAIGN: ANCIENT GREECE ─────────────────────────────────
  // ═══════════════════════════════════════════════════════════════

  const greece = await prisma.campaign.upsert({
    where: { name: "Ancient Greece" },
    update: {},
    create: {
      name: "Ancient Greece",
      description: "Explore the cradle of Western civilization, from the Minoans to Alexander the Great, through democracy, philosophy, and epic conflict.",
      sortOrder: 2,
      isActive: true,
      victoryMusic: "audio/victory_background_music.mp3",
    },
  });

  // ─── GREECE TILE MAPS ───────────────────────────────────────
  const GREECE_STAGE_1_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,4,4,4,5,0,0,0,0,9,0,0,0,0,3,4,4,4,4,4,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const GREECE_STAGE_2_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,5,0,0,0,0,3,4,4,4,5,0,0,0,3,4,4,5,0,0,0,0,3,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,4,4,5,0,0,0,0,0,9,0,0,0,0,0,0,3,4,4,4,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const GREECE_STAGE_3_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,5,0,0,0,0,0,0,0,3,4,4,5,0,0,0,3,4,5,0,0,0,0,0,0,0,3,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,3,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,5,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,5,0,0,0,0,0,3,4,4,5,0,0,0,0,0,0,0,3,4,5,0,0,0,0,0,3,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,4,5,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const GREECE_STAGE_4_MAP = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,5,0,0,0,0,3,4,5,0,0,0,0,0,0,0,0,0,0,0,0,3,4,5,0,0,0,0,3,4,4],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [4,4,4,4,4,4,5,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4],
    [0,0,0,0,0,0,0,0,0,0,3,4,4,4,4,4,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  // ─── GREECE STAGES ──────────────────────────────────────────
  const greeceStagesData = [
    {
      campaignId: greece.id,
      stageNum: 1,
      eraName: "Minoan & Mycenaean Civilizations",
      roundTime: 45,
      spawnInterval: 6,
      background: "images/backgrounds/stage_1_bg.png",
      requiresStomp: false,
      completionMessage: "You survived the Bronze Age!",
      retryMessage: "Even the great Mycenaean warriors fell before rising again. Try once more.",
      dialogueMusic: "audio/story1_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
      tileMap: GREECE_STAGE_1_MAP,
    },
    {
      campaignId: greece.id,
      stageNum: 2,
      eraName: "Rise of the Polis & Persian Wars",
      roundTime: 40,
      spawnInterval: 5,
      background: "images/backgrounds/stage_2_bg.png",
      requiresStomp: false,
      completionMessage: "Democracy endures! The Persians have been repelled!",
      retryMessage: "The Persians outnumber you, but the Greek spirit never breaks. Rise again.",
      dialogueMusic: "audio/story2_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
      tileMap: GREECE_STAGE_2_MAP,
    },
    {
      campaignId: greece.id,
      stageNum: 3,
      eraName: "Golden Age of Athens & Peloponnesian War",
      roundTime: 35,
      spawnInterval: 4,
      background: "images/backgrounds/stage_3_bg.png",
      requiresStomp: true,
      completionMessage: "Athens may have fallen, but its ideas live on forever!",
      retryMessage: "Even Socrates taught that failure is the beginning of wisdom. Try again.",
      dialogueMusic: "audio/story3_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
      tileMap: GREECE_STAGE_3_MAP,
    },
    {
      campaignId: greece.id,
      stageNum: 4,
      eraName: "Alexander the Great & Hellenistic Legacy",
      roundTime: 60,
      spawnInterval: 3,
      background: "images/backgrounds/stage_4_bg.png",
      requiresStomp: true,
      completionMessage: "You have conquered alongside Alexander and spread knowledge to the world!",
      retryMessage: "Alexander never accepted defeat. Neither should you. Rise and conquer!",
      dialogueMusic: "audio/story4_background_music.mp3",
      combatMusic: "audio/zk_background_music.wav",
      quizMusic: "audio/kahoot_quiz_music.mp3",
      tileMap: GREECE_STAGE_4_MAP,
    },
  ];

  const greeceStageRecords = [];
  for (const s of greeceStagesData) {
    const stage = await prisma.stage.upsert({
      where: { campaignId_stageNum: { campaignId: s.campaignId, stageNum: s.stageNum } },
      update: s,
      create: s,
    });
    greeceStageRecords.push(stage);
  }

  // ─── GREECE STAGE ENEMIES ───────────────────────────────────
  const greeceStageEnemies = [
    // Stage 1: Hoplite only
    { stageId: greeceStageRecords[0].id, enemyTemplateId: enemyMap.Hoplite, minSpeed: 1, maxSpeed: 3 },
    // Stage 2: Hoplite + Minotaur
    { stageId: greeceStageRecords[1].id, enemyTemplateId: enemyMap.Hoplite, minSpeed: 2, maxSpeed: 5 },
    { stageId: greeceStageRecords[1].id, enemyTemplateId: enemyMap.Minotaur, minSpeed: 2, maxSpeed: 5 },
    // Stage 3: Hoplite + Gorgon
    { stageId: greeceStageRecords[2].id, enemyTemplateId: enemyMap.Hoplite, minSpeed: 3, maxSpeed: 6 },
    { stageId: greeceStageRecords[2].id, enemyTemplateId: enemyMap.Gorgon, minSpeed: 3, maxSpeed: 6 },
    // Stage 4: All three
    { stageId: greeceStageRecords[3].id, enemyTemplateId: enemyMap.Hoplite, minSpeed: 4, maxSpeed: 8 },
    { stageId: greeceStageRecords[3].id, enemyTemplateId: enemyMap.Minotaur, minSpeed: 4, maxSpeed: 8 },
    { stageId: greeceStageRecords[3].id, enemyTemplateId: enemyMap.Gorgon, minSpeed: 4, maxSpeed: 8 },
  ];
  for (const se of greeceStageEnemies) {
    await prisma.stageEnemy.upsert({
      where: { stageId_enemyTemplateId: { stageId: se.stageId, enemyTemplateId: se.enemyTemplateId } },
      update: se,
      create: se,
    });
  }

  // ─── GREECE DIALOGUE LINES ──────────────────────────────────
  const greeceDialogues: { stageIdx: number; speaker: string; text: string; portrait: string }[] = [
    // ── Stage 1: Minoan & Mycenaean Civilizations ──
    { stageIdx: 0, speaker: "The Simulation", text: "New simulation loaded. A different land. A different lesson.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 0, speaker: "The Simulation", text: "You have proven you can learn from Persia. Now let us see if you can understand Greece.", portrait: "" },
    { stageIdx: 0, speaker: "The Simulation", text: "A civilization that gave the world democracy, philosophy, and the very concept of the citizen.", portrait: "images/simulation/simulation angry1.jpg" },
    { stageIdx: 0, speaker: "The Simulation", text: "But also one torn apart by its own rivalries and contradictions. We begin at the very start.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 0, speaker: "Narrator", text: "The Aegean Sea, dotted with hundreds of islands, cradled one of humanity's earliest European civilizations.", portrait: "images/narrator/narrator mouth1.jpg" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "Welcome to the Bronze Age, traveler. Around 3000 BC, a remarkable civilization arose on the island of Crete.", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "The Minoans built the great Palace of Knossos - a vast complex with over a thousand rooms, indoor plumbing, and vibrant frescoes.", portrait: "" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "They developed a writing system called Linear A, which remains undeciphered to this day. Their civilization was sophisticated, artistic, and peaceful.", portrait: "" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "Around 1600 BC, on the Greek mainland, another power rose: the Mycenaeans. Warriors and traders who built fortified citadels.", portrait: "" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "The Lion Gate of Mycenae still stands - a testament to their engineering skill. They adapted Minoan writing into Linear B, which we can read.", portrait: "" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "The Mycenaeans are the Greeks of Homer's epics. Their siege of Troy, around 1200 BC, became one of history's most famous stories.", portrait: "" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "But around 1200 BC, catastrophe struck. The Bronze Age Collapse destroyed civilizations across the Mediterranean.", portrait: "" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "The Mycenaean palaces burned. Writing was lost. Greece plunged into a Dark Age that lasted nearly four centuries.", portrait: "" },
    { stageIdx: 0, speaker: "Greek Scholar", text: "Yet from those ashes, something extraordinary would emerge: the Greek city-state.", portrait: "" },
    { stageIdx: 0, speaker: "The Simulation", text: "Civilizations rise and fall. The question is what rises from the ruins. Now face the echoes of the Bronze Age.", portrait: "images/simulation/simulation angry1.jpg" },

    // ── Stage 2: Rise of the Polis & Persian Wars ──
    { stageIdx: 1, speaker: "The Simulation", text: "You endured the Bronze Age. But the true test of Greece lies ahead.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 1, speaker: "The Simulation", text: "What happens when a people decide to govern themselves? When citizens - not kings - hold power?", portrait: "" },
    { stageIdx: 1, speaker: "Greek Scholar", text: "By the 8th century BC, Greece had reorganized into independent city-states called poleis. Athens. Sparta. Corinth. Thebes.", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { stageIdx: 1, speaker: "Greek Scholar", text: "Each polis was fiercely independent, with its own laws, army, and identity. They competed but also shared a common Greek culture.", portrait: "" },
    { stageIdx: 1, speaker: "Pericles", text: "In 508 BC, a nobleman named Cleisthenes transformed Athens forever. He broke the power of the old aristocratic families.", portrait: "images/pericles/pericles neutral1.jpg" },
    { stageIdx: 1, speaker: "Pericles", text: "He created a system where every male citizen could vote directly on laws and policy. Not representatives - the citizens themselves.", portrait: "" },
    { stageIdx: 1, speaker: "Pericles", text: "This was demokratia - rule by the people. The world's first democracy.", portrait: "" },
    { stageIdx: 1, speaker: "Greek Scholar", text: "But this young democracy soon faced its greatest test. The Persian Empire - the mightiest power on Earth - turned its gaze toward Greece.", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { stageIdx: 1, speaker: "Leonidas", text: "In 490 BC, King Darius sent a massive army to punish Athens for supporting a revolt in Persian territory.", portrait: "images/leonidas/leonidas neutral1.jpg" },
    { stageIdx: 1, speaker: "Leonidas", text: "The Athenians, outnumbered, met the Persians on the plain of Marathon. Against all odds, they won. A messenger ran 26 miles to Athens to announce victory.", portrait: "" },
    { stageIdx: 1, speaker: "Leonidas", text: "Ten years later, Darius's son Xerxes returned with an even larger army. Over a hundred thousand soldiers.", portrait: "" },
    { stageIdx: 1, speaker: "Leonidas", text: "I led three hundred Spartans and a small Greek force to the narrow pass of Thermopylae. We held the pass for three days against the entire Persian army.", portrait: "" },
    { stageIdx: 1, speaker: "Leonidas", text: "We fell, but we bought Greece time. The Athenian fleet, led by Themistocles, destroyed the Persian navy at the Battle of Salamis.", portrait: "" },
    { stageIdx: 1, speaker: "Greek Scholar", text: "The Persian Wars proved that free citizens fighting for their homeland could defeat even the greatest empire. It changed the course of history.", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { stageIdx: 1, speaker: "The Simulation", text: "Freedom is not given. It is defended. Now show me you understand the cost.", portrait: "images/simulation/simulation angry1.jpg" },

    // ── Stage 3: Golden Age of Athens & Peloponnesian War ──
    { stageIdx: 2, speaker: "The Simulation", text: "Victory over Persia gave Athens confidence. Perhaps too much confidence.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 2, speaker: "The Simulation", text: "What happens when a democracy becomes an empire? When defenders become conquerors?", portrait: "" },
    { stageIdx: 2, speaker: "Pericles", text: "After the Persian Wars, I led Athens into its Golden Age. We rebuilt what the Persians had destroyed - and built it greater.", portrait: "images/pericles/pericles neutral1.jpg" },
    { stageIdx: 2, speaker: "Pericles", text: "The Parthenon, temple of Athena, crowned the Acropolis. It remains one of the most perfect buildings ever constructed.", portrait: "" },
    { stageIdx: 2, speaker: "Pericles", text: "We funded playwrights like Sophocles and Euripides. Drama, comedy, tragedy - Athens invented theater as we know it.", portrait: "" },
    { stageIdx: 2, speaker: "Pericles", text: "Our democracy was the envy of the Greek world. I told the Athenians: we are a model for others, not imitators of anyone.", portrait: "" },
    { stageIdx: 2, speaker: "Socrates", text: "And in the agora - the marketplace - I walked among the citizens, asking questions.", portrait: "images/socrates/socrates neutral1.jpg" },
    { stageIdx: 2, speaker: "Socrates", text: "The unexamined life is not worth living. I taught not by giving answers, but by asking the right questions.", portrait: "" },
    { stageIdx: 2, speaker: "Socrates", text: "My method was simple: challenge every assumption. Question what you think you know. Only then can wisdom begin.", portrait: "" },
    { stageIdx: 2, speaker: "Greek Scholar", text: "But Athens's power made other city-states afraid. Sparta, with its military might, led an alliance against Athens.", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { stageIdx: 2, speaker: "Greek Scholar", text: "The Peloponnesian War erupted in 431 BC. Athens with its navy against Sparta with its army. Greece tore itself apart for 27 years.", portrait: "" },
    { stageIdx: 2, speaker: "Greek Scholar", text: "A devastating plague killed Pericles and a third of Athens. The war ended in 404 BC with Athens's surrender.", portrait: "" },
    { stageIdx: 2, speaker: "Socrates", text: "In the aftermath, Athens turned on its own. I was put on trial for 'corrupting the youth' and 'impiety.'", portrait: "images/socrates/socrates neutral1.jpg" },
    { stageIdx: 2, speaker: "Socrates", text: "I was sentenced to death by drinking hemlock. I accepted it. A philosopher must live - and die - by his principles.", portrait: "" },
    { stageIdx: 2, speaker: "The Simulation", text: "The greatest enemy of civilization is not the outsider. It is the rot within. Now face the consequences of division.", portrait: "images/simulation/simulation angry1.jpg" },

    // ── Stage 4: Alexander the Great & Hellenistic Legacy ──
    { stageIdx: 3, speaker: "The Simulation", text: "This is your final trial in Greece. The lesson of legacy.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 3, speaker: "The Simulation", text: "What happens when one man carries an entire civilization's knowledge to the ends of the Earth?", portrait: "" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "While the Greek city-states weakened each other through war, a new power rose in the north: Macedonia.", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "King Philip II united the quarreling Greek states by force and diplomacy. But it was his son who would change the world forever.", portrait: "" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "Alexander, tutored by Aristotle himself, became king at just twenty years old when Philip was assassinated in 336 BC.", portrait: "" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "Within thirteen years, Alexander conquered the Persian Empire, Egypt, and pushed as far as India. He was just thirty-two when he died.", portrait: "" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "He founded over twenty cities, including Alexandria in Egypt, which became the greatest center of learning in the ancient world.", portrait: "" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "The Library of Alexandria held hundreds of thousands of scrolls - the accumulated knowledge of the ancient world in one place.", portrait: "" },
    { stageIdx: 3, speaker: "Socrates", text: "Alexander spread Greek language, philosophy, and science across three continents. My student Plato's student Aristotle taught Alexander.", portrait: "images/socrates/socrates neutral1.jpg" },
    { stageIdx: 3, speaker: "Socrates", text: "And so the chain of knowledge passed: from my questions in the agora, to Plato's Academy, to Aristotle's Lyceum, to the ends of the Earth.", portrait: "" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "After Alexander's death, his empire split, but Greek culture - Hellenistic culture - flourished for centuries.", portrait: "images/greek_scholar/greek_scholar neutral1.jpg" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "Euclid wrote the Elements of geometry. Archimedes discovered the principles of physics. Eratosthenes calculated the circumference of the Earth.", portrait: "" },
    { stageIdx: 3, speaker: "Greek Scholar", text: "Greek democracy, philosophy, theater, science, and art became the foundation of Western civilization.", portrait: "" },
    { stageIdx: 3, speaker: "The Simulation", text: "This is your final test. The Titans of myth - primal forces of chaos - rise against the order that Greece brought to the world.", portrait: "images/simulation/simulation neutral1.jpg" },
    { stageIdx: 3, speaker: "The Simulation", text: "Defeat them, and prove that knowledge and reason can triumph over ignorance and destruction.", portrait: "" },
    { stageIdx: 3, speaker: "The Simulation", text: "Fail... and the Library of Alexandria burns again.", portrait: "images/simulation/simulation angry1.jpg" },
  ];

  for (let i = 0; i < greeceDialogues.length; i++) {
    const d = greeceDialogues[i];
    await prisma.dialogueLine.create({
      data: {
        stageId: greeceStageRecords[d.stageIdx].id,
        characterId: charMap[d.speaker],
        text: d.text,
        portrait: d.portrait,
        sortOrder: i,
      },
    });
  }

  // ─── GREECE QUESTIONS ──────────────────────────────────────
  const greeceQuestions = [
    // Stage 1: Minoan & Mycenaean Civilizations
    { stageIdx: 0, text: "What civilization built the Palace of Knossos on the island of Crete?", choices: ["The Mycenaeans", "The Minoans", "The Athenians", "The Spartans"], correctIndex: 1, explanation: "The Minoans built the magnificent Palace of Knossos around 2000 BC. It had over a thousand rooms, indoor plumbing, and elaborate frescoes." },
    { stageIdx: 0, text: "What writing system did the Mycenaeans use?", choices: ["Linear A", "Hieroglyphics", "Linear B", "Cuneiform"], correctIndex: 2, explanation: "The Mycenaeans adapted the Minoan Linear A script into Linear B, which was deciphered in 1952 and found to record an early form of Greek." },
    { stageIdx: 0, text: "Where was the Minoan civilization primarily centered?", choices: ["The Greek mainland", "The island of Crete", "Sicily", "Asia Minor"], correctIndex: 1, explanation: "The Minoan civilization flourished on the island of Crete from approximately 3000 to 1450 BC, making it the earliest advanced European civilization." },
    { stageIdx: 0, text: "What catastrophic event ended the Bronze Age civilizations around 1200 BC?", choices: ["A volcanic eruption", "The Bronze Age Collapse", "The Trojan War", "A great flood"], correctIndex: 1, explanation: "The Bronze Age Collapse around 1200 BC was a widespread societal breakdown that destroyed multiple civilizations across the Mediterranean, including Mycenaean Greece." },
    { stageIdx: 0, text: "What legendary war is associated with Mycenaean Greece?", choices: ["The Persian Wars", "The Peloponnesian War", "The Trojan War", "The Punic Wars"], correctIndex: 2, explanation: "The Trojan War, immortalized in Homer's Iliad, is set during the Mycenaean period around 1200 BC. Archaeological evidence suggests Troy was a real city that was destroyed." },

    // Stage 2: Rise of the Polis & Persian Wars
    { stageIdx: 1, text: "Who is credited with establishing Athenian democracy in 508 BC?", choices: ["Pericles", "Solon", "Cleisthenes", "Themistocles"], correctIndex: 2, explanation: "Cleisthenes reformed the Athenian political system in 508 BC, breaking the power of aristocratic families and creating a system where all male citizens could vote directly on laws." },
    { stageIdx: 1, text: "In what year was the Battle of Marathon fought?", choices: ["490 BC", "480 BC", "431 BC", "508 BC"], correctIndex: 0, explanation: "The Battle of Marathon in 490 BC was a decisive Athenian victory over the invading Persian army of King Darius I. A messenger's run to announce the victory inspired the modern marathon race." },
    { stageIdx: 1, text: "Which Spartan king led 300 warriors at the Battle of Thermopylae?", choices: ["Xerxes", "Leonidas", "Lysander", "Cleomenes"], correctIndex: 1, explanation: "King Leonidas I of Sparta led 300 Spartans and a small Greek force at the narrow pass of Thermopylae in 480 BC, holding off the massive Persian army for three days." },
    { stageIdx: 1, text: "What decisive naval battle ended Xerxes' invasion of Greece?", choices: ["Battle of Marathon", "Battle of Plataea", "Battle of Salamis", "Battle of Thermopylae"], correctIndex: 2, explanation: "The Battle of Salamis in 480 BC was a decisive Greek naval victory. Themistocles lured the larger Persian fleet into the narrow straits where their numbers became a disadvantage." },
    { stageIdx: 1, text: "What was a Greek city-state called?", choices: ["A demos", "A polis", "An agora", "An acropolis"], correctIndex: 1, explanation: "A Greek city-state was called a polis (plural: poleis). Each polis was an independent political unit with its own government, laws, and army, forming the basic unit of Greek political life." },

    // Stage 3: Golden Age & Peloponnesian War
    { stageIdx: 2, text: "Who led Athens during its Golden Age in the 5th century BC?", choices: ["Socrates", "Pericles", "Cleisthenes", "Alexander"], correctIndex: 1, explanation: "Pericles led Athens during its Golden Age (roughly 461-429 BC), overseeing the construction of the Parthenon, the flourishing of democracy, and the height of Athenian cultural achievement." },
    { stageIdx: 2, text: "What famous temple was built on the Athenian Acropolis during the Golden Age?", choices: ["The Temple of Zeus", "The Parthenon", "The Oracle of Delphi", "The Colosseum"], correctIndex: 1, explanation: "The Parthenon, dedicated to the goddess Athena, was built between 447-432 BC under Pericles' direction. It is considered one of the finest examples of classical Greek architecture." },
    { stageIdx: 2, text: "What was Socrates' famous teaching method called?", choices: ["The Platonic Method", "The Aristotelian Method", "The Socratic Method", "The Dialectic Method"], correctIndex: 2, explanation: "The Socratic Method involves asking a series of probing questions to stimulate critical thinking and illuminate ideas. Rather than lecturing, Socrates drew knowledge out of his students through questioning." },
    { stageIdx: 2, text: "Which two city-states fought the Peloponnesian War?", choices: ["Athens and Persia", "Sparta and Thebes", "Athens and Sparta", "Corinth and Athens"], correctIndex: 2, explanation: "The Peloponnesian War (431-404 BC) was fought between Athens and its Delian League allies against Sparta and its Peloponnesian League allies, ending in Athens's defeat." },
    { stageIdx: 2, text: "How was Socrates sentenced to die?", choices: ["Execution by sword", "Exile from Athens", "Drinking hemlock poison", "Imprisonment for life"], correctIndex: 2, explanation: "In 399 BC, Socrates was found guilty of 'corrupting the youth' and 'impiety.' He was sentenced to death by drinking a cup of hemlock poison, which he accepted calmly." },

    // Stage 4: Alexander the Great & Hellenistic Legacy
    { stageIdx: 3, text: "Who was Alexander the Great's famous tutor?", choices: ["Socrates", "Plato", "Aristotle", "Euclid"], correctIndex: 2, explanation: "Aristotle, one of history's greatest philosophers, tutored Alexander from age 13. Aristotle instilled in Alexander a love of learning, science, and Homer's epics." },
    { stageIdx: 3, text: "What empire did Alexander conquer first on his campaign of expansion?", choices: ["The Egyptian Empire", "The Persian Empire", "The Indian Kingdoms", "The Roman Republic"], correctIndex: 1, explanation: "Alexander first conquered the Persian Achaemenid Empire, defeating King Darius III in battles at Granicus (334 BC), Issus (333 BC), and Gaugamela (331 BC)." },
    { stageIdx: 3, text: "What famous city in Egypt did Alexander found?", choices: ["Cairo", "Memphis", "Alexandria", "Thebes"], correctIndex: 2, explanation: "Alexander founded Alexandria in 331 BC. It became the intellectual capital of the ancient world, home to the Great Library and the Lighthouse - one of the Seven Wonders." },
    { stageIdx: 3, text: "What is the period after Alexander's death called?", choices: ["The Classical Period", "The Archaic Period", "The Hellenistic Period", "The Dark Ages"], correctIndex: 2, explanation: "The Hellenistic Period (323-31 BC) followed Alexander's death. Greek culture spread across his former empire, blending with local traditions and producing advances in science, art, and philosophy." },
    { stageIdx: 3, text: "Why is Ancient Greece's legacy important for education and democracy today?", choices: ["They had the largest army", "They established foundations of philosophy, science, democracy, and systematic education", "They conquered the most territory", "They invented writing"], correctIndex: 1, explanation: "Greece gave the world democracy, the Socratic method of inquiry, foundational works of philosophy, the beginnings of Western science, theater, and the concept of citizenship - principles still central to civilization." },
  ];

  for (let i = 0; i < greeceQuestions.length; i++) {
    const q = greeceQuestions[i];
    await prisma.question.create({
      data: {
        stageId: greeceStageRecords[q.stageIdx].id,
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        sortOrder: i,
      },
    });
  }

  // ─── GREECE MODIFIER POOLS ──────────────────────────────────
  for (const stage of greeceStageRecords) {
    for (const mod of positiveMods) {
      await prisma.modifierPool.upsert({
        where: { stageId_modifierDefId: { stageId: stage.id, modifierDefId: mod.id } },
        update: {},
        create: { stageId: stage.id, modifierDefId: mod.id },
      });
    }
  }

  // ─── GREECE VICTORY DIALOGUE ────────────────────────────────
  const greeceVictoryLines = [
    { speaker: "The Simulation", text: "Remarkable. You have journeyed from the Bronze Age palaces of Crete to the libraries of Alexandria.", portrait: "images/simulation/simulation neutral1.jpg" },
    { speaker: "The Simulation", text: "You have witnessed democracy born, defended, and nearly destroyed by its own creators.", portrait: "" },
    { speaker: "The Simulation", text: "Socrates taught that wisdom begins with knowing what you do not know. Pericles showed that free people can build wonders.", portrait: "images/simulation/simulation angry1.jpg" },
    { speaker: "The Simulation", text: "Alexander proved that knowledge, carried far enough, can transform the world. But also that no empire lasts forever.", portrait: "images/simulation/simulation neutral1.jpg" },
    { speaker: "The Simulation", text: "Greece's true legacy is not marble or bronze. It is the idea that every person can think, question, and govern themselves.", portrait: "" },
    { speaker: "The Simulation", text: "You are free once more, traveler. Remember: the unexamined life is not worth living.", portrait: "" },
  ];

  for (let i = 0; i < greeceVictoryLines.length; i++) {
    const vl = greeceVictoryLines[i];
    await prisma.victoryLine.create({
      data: {
        campaignId: greece.id,
        characterId: charMap[vl.speaker],
        text: vl.text,
        portrait: vl.portrait,
        sortOrder: i,
      },
    });
  }

  console.log("Seed complete! Persia + Greece campaigns with stages, dialogue, questions, enemies, modifiers, and victory dialogue loaded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
