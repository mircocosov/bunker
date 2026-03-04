-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('guest_pending', 'active', 'suspended', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'guest_pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ru',
    "pronouns" TEXT,
    "statsJson" JSONB,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "ruleSetId" TEXT,
    "maxPlayers" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 0,
    "seed" TEXT NOT NULL,
    "scenarioId" TEXT,
    "bunkerConfigId" TEXT,
    "eventSeq" INTEGER NOT NULL DEFAULT 0,
    "snapshotJson" JSONB,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerState" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seatNo" INTEGER NOT NULL,
    "isAlive" BOOLEAN NOT NULL DEFAULT true,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "revealed" JSONB,
    "penaltiesJson" JSONB,
    "voteWeight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PlayerState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardDefinition" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "titleJson" JSONB NOT NULL,
    "descriptionJson" JSONB,
    "weight" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL,
    "powerScore" INTEGER NOT NULL,
    "incompatibleWith" JSONB,
    "requiredWith" JSONB,
    "tagsJson" JSONB,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CardDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardInstance" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "cardDefinitionId" TEXT NOT NULL,
    "isRevealed" BOOLEAN NOT NULL DEFAULT false,
    "revealedAt" TIMESTAMP(3),

    CONSTRAINT "CardInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckCard" (
    "deckId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "DeckCard_pkey" PRIMARY KEY ("deckId","cardId")
);

-- CreateTable
CREATE TABLE "DisasterScenario" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirementsJson" JSONB NOT NULL,
    "difficulty" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "DisasterScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BunkerConfig" (
    "id" TEXT NOT NULL,
    "capacityFormula" TEXT NOT NULL,
    "resourcesJson" JSONB NOT NULL,
    "modulesJson" JSONB NOT NULL,
    "defectsJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "BunkerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "voterUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "matchId" TEXT,
    "authorUserId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "moderationStatus" TEXT NOT NULL DEFAULT 'posted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetMessageId" TEXT,
    "reason" TEXT NOT NULL,
    "evidenceJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'new',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "ip" TEXT,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "key" TEXT NOT NULL,
    "env" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "rolloutPercent" INTEGER NOT NULL,
    "rolesJson" JSONB,
    "conditionsJson" JSONB,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("key","env")
);

-- CreateTable
CREATE TABLE "GameRuleSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "localeScope" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "rulesJson" JSONB NOT NULL,
    "stateMachineJson" JSONB NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalizationKey" (
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalizationKey_pkey" PRIMARY KEY ("key","locale")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Profile_nickname_key" ON "Profile"("nickname");
CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");
CREATE INDEX "Room_visibility_status_idx" ON "Room"("visibility", "status");
CREATE INDEX "Match_roomId_idx" ON "Match"("roomId");
CREATE INDEX "Match_state_idx" ON "Match"("state");
CREATE UNIQUE INDEX "PlayerState_matchId_userId_key" ON "PlayerState"("matchId", "userId");
CREATE INDEX "PlayerState_matchId_isAlive_idx" ON "PlayerState"("matchId", "isAlive");
CREATE INDEX "CardDefinition_category_status_idx" ON "CardDefinition"("category", "status");
CREATE INDEX "CardDefinition_rarity_weight_idx" ON "CardDefinition"("rarity", "weight");
CREATE UNIQUE INDEX "CardInstance_matchId_playerId_cardDefinitionId_key" ON "CardInstance"("matchId", "playerId", "cardDefinitionId");
CREATE UNIQUE INDEX "Deck_name_version_key" ON "Deck"("name", "version");
CREATE INDEX "DisasterScenario_difficulty_status_idx" ON "DisasterScenario"("difficulty", "status");
CREATE INDEX "BunkerConfig_status_version_idx" ON "BunkerConfig"("status", "version");
CREATE UNIQUE INDEX "Vote_matchId_round_voterUserId_key" ON "Vote"("matchId", "round", "voterUserId");
CREATE INDEX "Vote_targetUserId_idx" ON "Vote"("targetUserId");
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");
CREATE INDEX "ChatMessage_moderationStatus_idx" ON "ChatMessage"("moderationStatus");
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX "Report_targetUserId_idx" ON "Report"("targetUserId");
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE UNIQUE INDEX "GameRuleSet_name_version_key" ON "GameRuleSet"("name", "version");
CREATE INDEX "GameRuleSet_mode_status_idx" ON "GameRuleSet"("mode", "status");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Room" ADD CONSTRAINT "Room_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Room" ADD CONSTRAINT "Room_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "GameRuleSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
