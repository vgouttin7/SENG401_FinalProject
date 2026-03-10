-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "stageNum" INTEGER NOT NULL,
    "eraName" TEXT NOT NULL,
    "roundTime" INTEGER NOT NULL DEFAULT 45,
    "spawnInterval" INTEGER NOT NULL DEFAULT 6,
    "background" TEXT NOT NULL DEFAULT '',
    "requiresStomp" BOOLEAN NOT NULL DEFAULT false,
    "tileMap" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#ffffff',
    "portrait" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'narrator',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DialogueLine" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DialogueLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnemyTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "speedModifier" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL DEFAULT 1,
    "spriteWalk" TEXT NOT NULL DEFAULT '',
    "spriteDead" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnemyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageEnemy" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "enemyTemplateId" INTEGER NOT NULL,
    "minSpeed" INTEGER NOT NULL DEFAULT 1,
    "maxSpeed" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "StageEnemy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "choices" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModifierDef" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "value" DOUBLE PRECISION NOT NULL,
    "isPositive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModifierDef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModifierPool" (
    "id" SERIAL NOT NULL,
    "stageId" INTEGER NOT NULL,
    "modifierDefId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ModifierPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "horizontalAcceleration" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "friction" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "verticalAcceleration" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "jumpSpeed" DOUBLE PRECISION NOT NULL DEFAULT 23,
    "startingHealth" INTEGER NOT NULL DEFAULT 100,
    "beamVelocity" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "beamRange" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpriteAsset" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpriteAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TileType" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#888888',
    "sprite" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TileType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_name_key" ON "Campaign"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_campaignId_stageNum_key" ON "Stage"("campaignId", "stageNum");

-- CreateIndex
CREATE INDEX "DialogueLine_stageId_sortOrder_idx" ON "DialogueLine"("stageId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EnemyTemplate_name_key" ON "EnemyTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StageEnemy_stageId_enemyTemplateId_key" ON "StageEnemy"("stageId", "enemyTemplateId");

-- CreateIndex
CREATE INDEX "Question_stageId_sortOrder_idx" ON "Question"("stageId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ModifierPool_stageId_modifierDefId_key" ON "ModifierPool"("stageId", "modifierDefId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerConfig_name_key" ON "PlayerConfig"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SpriteAsset_category_name_key" ON "SpriteAsset"("category", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TileType_code_key" ON "TileType"("code");

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueLine" ADD CONSTRAINT "DialogueLine_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DialogueLine" ADD CONSTRAINT "DialogueLine_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageEnemy" ADD CONSTRAINT "StageEnemy_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageEnemy" ADD CONSTRAINT "StageEnemy_enemyTemplateId_fkey" FOREIGN KEY ("enemyTemplateId") REFERENCES "EnemyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierPool" ADD CONSTRAINT "ModifierPool_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierPool" ADD CONSTRAINT "ModifierPool_modifierDefId_fkey" FOREIGN KEY ("modifierDefId") REFERENCES "ModifierDef"("id") ON DELETE CASCADE ON UPDATE CASCADE;
