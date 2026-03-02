/*
  Warnings:

  - The values [KICKED,TIMEOUT] on the enum `LobbyPlayerStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LobbyPlayerStatus_new" AS ENUM ('REGISTERED', 'ALIVE', 'EXPELLED', 'SPECTATOR', 'DISCONNECTED');
ALTER TABLE "LobbyPlayer" ALTER COLUMN "status" TYPE "LobbyPlayerStatus_new" USING ("status"::text::"LobbyPlayerStatus_new");
ALTER TYPE "LobbyPlayerStatus" RENAME TO "LobbyPlayerStatus_old";
ALTER TYPE "LobbyPlayerStatus_new" RENAME TO "LobbyPlayerStatus";
DROP TYPE "LobbyPlayerStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "LobbyPlayer" DROP CONSTRAINT "LobbyPlayer_lobbyId_fkey";

-- DropForeignKey
ALTER TABLE "LobbyPlayer" DROP CONSTRAINT "LobbyPlayer_userId_fkey";

-- DropForeignKey
ALTER TABLE "SiteChatMessage" DROP CONSTRAINT "SiteChatMessage_userId_fkey";

-- AlterTable
ALTER TABLE "AuthAttempt" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "consumedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BannedUser" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LobbyPlayer" ALTER COLUMN "lastSeenAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "reconnectDeadline" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SiteChatMessage" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PlayerCard" (
    "id" TEXT NOT NULL,
    "lobbyPlayerId" TEXT NOT NULL,
    "genderAge" TEXT NOT NULL,
    "fertility" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "phobia" TEXT NOT NULL,
    "health" TEXT NOT NULL,
    "hobby" TEXT NOT NULL,
    "luggage" TEXT NOT NULL,
    "fact1" TEXT NOT NULL,
    "fact2" TEXT NOT NULL,
    "actionCard1" TEXT NOT NULL,
    "actionCard2" TEXT NOT NULL,
    "revealedFields" JSONB NOT NULL,

    CONSTRAINT "PlayerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "rounds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayerResult" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundsSurvived" INTEGER NOT NULL,
    "outcome" "Outcome" NOT NULL,

    CONSTRAINT "GamePlayerResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profession" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Profession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phobia" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Phobia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hobby" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Hobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Luggage" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Luggage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fact" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Health" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "severity" TEXT,

    CONSTRAINT "Health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionCard" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetField" TEXT,
    "upgradeText" TEXT,

    CONSTRAINT "ActionCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CosmeticItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assetKey" TEXT NOT NULL,
    "requiredWins" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CosmeticItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCosmetics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skinColor" TEXT,
    "face" TEXT,
    "hair" TEXT,
    "hat" TEXT,
    "pet" TEXT,
    "clothes" TEXT,

    CONSTRAINT "UserCosmetics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApocalypseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ApocalypseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BunkerLocationType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BunkerLocationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenePreset" (
    "id" TEXT NOT NULL,
    "apocalypseTypeId" TEXT NOT NULL,
    "bunkerLocationTypeId" TEXT NOT NULL,
    "groundYPercent" INTEGER NOT NULL,

    CONSTRAINT "ScenePreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SceneLayer" (
    "id" TEXT NOT NULL,
    "scenePresetId" TEXT NOT NULL,
    "kind" "SceneLayerKind" NOT NULL,
    "assetKey" TEXT NOT NULL,
    "zIndex" INTEGER NOT NULL,
    "offsetX" INTEGER NOT NULL DEFAULT 0,
    "offsetY" INTEGER NOT NULL DEFAULT 0,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "repeatX" BOOLEAN NOT NULL DEFAULT false,
    "groundYPercent" INTEGER,

    CONSTRAINT "SceneLayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCard_lobbyPlayerId_key" ON "PlayerCard"("lobbyPlayerId");

-- CreateIndex
CREATE UNIQUE INDEX "Profession_value_key" ON "Profession"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Phobia_value_key" ON "Phobia"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Hobby_value_key" ON "Hobby"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Luggage_value_key" ON "Luggage"("value");

-- CreateIndex
CREATE UNIQUE INDEX "Fact_value_key" ON "Fact"("value");

-- CreateIndex
CREATE UNIQUE INDEX "UserCosmetics_userId_key" ON "UserCosmetics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApocalypseType_name_key" ON "ApocalypseType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BunkerLocationType_name_key" ON "BunkerLocationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ScenePreset_apocalypseTypeId_bunkerLocationTypeId_key" ON "ScenePreset"("apocalypseTypeId", "bunkerLocationTypeId");

-- AddForeignKey
ALTER TABLE "AuthAttempt" ADD CONSTRAINT "AuthAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyPlayer" ADD CONSTRAINT "LobbyPlayer_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyPlayer" ADD CONSTRAINT "LobbyPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayerResult" ADD CONSTRAINT "GamePlayerResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteChatMessage" ADD CONSTRAINT "SiteChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCosmetics" ADD CONSTRAINT "UserCosmetics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenePreset" ADD CONSTRAINT "ScenePreset_apocalypseTypeId_fkey" FOREIGN KEY ("apocalypseTypeId") REFERENCES "ApocalypseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenePreset" ADD CONSTRAINT "ScenePreset_bunkerLocationTypeId_fkey" FOREIGN KEY ("bunkerLocationTypeId") REFERENCES "BunkerLocationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SceneLayer" ADD CONSTRAINT "SceneLayer_scenePresetId_fkey" FOREIGN KEY ("scenePresetId") REFERENCES "ScenePreset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
