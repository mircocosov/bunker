-- Initial schema for bunker
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "LobbyPlayerStatus" AS ENUM ('REGISTERED', 'ALIVE', 'EXPELLED', 'SPECTATOR', 'DISCONNECTED');
CREATE TYPE "Outcome" AS ENUM ('WIN', 'LOSE', 'KICKED', 'TIMEOUT', 'SPECTATOR');
CREATE TYPE "SceneLayerKind" AS ENUM ('SKY', 'MID', 'GROUND', 'FOREGROUND');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "twitchNick" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthAttempt" (
  "id" TEXT NOT NULL,
  "twitchNick" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lobby" (
  "id" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "playersLimit" INTEGER NOT NULL,
  "voteTimerSec" INTEGER NOT NULL,
  "revealTimerSec" INTEGER NOT NULL,
  "initialRevealedCount" INTEGER NOT NULL,
  "phase" TEXT NOT NULL,
  "apocalypseTypeId" TEXT,
  "bunkerLocationTypeId" TEXT,
  CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LobbyPlayer" (
  "id" TEXT NOT NULL,
  "lobbyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "LobbyPlayerStatus" NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reconnectDeadline" TIMESTAMP(3),
  CONSTRAINT "LobbyPlayer_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "Game" (
  "id" TEXT NOT NULL,
  "lobbyId" TEXT NOT NULL,
  "rounds" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GamePlayerResult" (
  "id" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roundsSurvived" INTEGER NOT NULL,
  "outcome" "Outcome" NOT NULL,
  CONSTRAINT "GamePlayerResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BannedUser" (
  "id" TEXT NOT NULL,
  "twitchNick" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BannedUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteChatMessage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatFilterWord" (
  "id" TEXT NOT NULL,
  "word" TEXT NOT NULL,
  CONSTRAINT "ChatFilterWord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profession" (
  "id" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "Profession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Phobia" (
  "id" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "Phobia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Hobby" (
  "id" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "Hobby_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Luggage" (
  "id" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "Luggage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Fact" (
  "id" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  CONSTRAINT "Fact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Health" (
  "id" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "severity" TEXT,
  CONSTRAINT "Health_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActionCard" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "targetField" TEXT,
  "upgradeText" TEXT,
  CONSTRAINT "ActionCard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CosmeticItem" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "assetKey" TEXT NOT NULL,
  "requiredWins" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CosmeticItem_pkey" PRIMARY KEY ("id")
);

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

CREATE TABLE "ApocalypseType" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "ApocalypseType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BunkerLocationType" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "BunkerLocationType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScenePreset" (
  "id" TEXT NOT NULL,
  "apocalypseTypeId" TEXT NOT NULL,
  "bunkerLocationTypeId" TEXT NOT NULL,
  "groundYPercent" INTEGER NOT NULL,
  CONSTRAINT "ScenePreset_pkey" PRIMARY KEY ("id")
);

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

CREATE UNIQUE INDEX "User_twitchNick_key" ON "User"("twitchNick");
CREATE UNIQUE INDEX "LobbyPlayer_lobbyId_userId_key" ON "LobbyPlayer"("lobbyId", "userId");
CREATE UNIQUE INDEX "PlayerCard_lobbyPlayerId_key" ON "PlayerCard"("lobbyPlayerId");
CREATE UNIQUE INDEX "BannedUser_twitchNick_key" ON "BannedUser"("twitchNick");
CREATE UNIQUE INDEX "ChatFilterWord_word_key" ON "ChatFilterWord"("word");
CREATE UNIQUE INDEX "Profession_value_key" ON "Profession"("value");
CREATE UNIQUE INDEX "Phobia_value_key" ON "Phobia"("value");
CREATE UNIQUE INDEX "Hobby_value_key" ON "Hobby"("value");
CREATE UNIQUE INDEX "Luggage_value_key" ON "Luggage"("value");
CREATE UNIQUE INDEX "Fact_value_key" ON "Fact"("value");
CREATE UNIQUE INDEX "UserCosmetics_userId_key" ON "UserCosmetics"("userId");
CREATE UNIQUE INDEX "ApocalypseType_name_key" ON "ApocalypseType"("name");
CREATE UNIQUE INDEX "BunkerLocationType_name_key" ON "BunkerLocationType"("name");
CREATE UNIQUE INDEX "ScenePreset_apocalypseTypeId_bunkerLocationTypeId_key" ON "ScenePreset"("apocalypseTypeId", "bunkerLocationTypeId");

ALTER TABLE "LobbyPlayer"
  ADD CONSTRAINT "LobbyPlayer_lobbyId_fkey"
  FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LobbyPlayer"
  ADD CONSTRAINT "LobbyPlayer_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GamePlayerResult"
  ADD CONSTRAINT "GamePlayerResult_gameId_fkey"
  FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SiteChatMessage"
  ADD CONSTRAINT "SiteChatMessage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserCosmetics"
  ADD CONSTRAINT "UserCosmetics_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ScenePreset"
  ADD CONSTRAINT "ScenePreset_apocalypseTypeId_fkey"
  FOREIGN KEY ("apocalypseTypeId") REFERENCES "ApocalypseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ScenePreset"
  ADD CONSTRAINT "ScenePreset_bunkerLocationTypeId_fkey"
  FOREIGN KEY ("bunkerLocationTypeId") REFERENCES "BunkerLocationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SceneLayer"
  ADD CONSTRAINT "SceneLayer_scenePresetId_fkey"
  FOREIGN KEY ("scenePresetId") REFERENCES "ScenePreset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
