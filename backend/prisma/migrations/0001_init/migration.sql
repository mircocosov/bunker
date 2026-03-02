-- Initial schema for bunker
CREATE TYPE "Role" AS ENUM ('USER','ADMIN');
CREATE TYPE "LobbyPlayerStatus" AS ENUM ('ALIVE','SPECTATOR','KICKED','TIMEOUT');
CREATE TYPE "Outcome" AS ENUM ('WIN','LOSE','KICKED','TIMEOUT','SPECTATOR');
CREATE TYPE "SceneLayerKind" AS ENUM ('SKY','MID','GROUND','FOREGROUND');

CREATE TABLE "User" ("id" TEXT PRIMARY KEY, "twitchNick" TEXT UNIQUE NOT NULL, "role" "Role" NOT NULL DEFAULT 'USER');
CREATE TABLE "AuthAttempt" ("id" TEXT PRIMARY KEY, "twitchNick" TEXT NOT NULL, "code" TEXT NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "consumedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Lobby" ("id" TEXT PRIMARY KEY, "isActive" BOOLEAN NOT NULL DEFAULT true, "playersLimit" INT NOT NULL, "voteTimerSec" INT NOT NULL, "revealTimerSec" INT NOT NULL, "initialRevealedCount" INT NOT NULL, "phase" TEXT NOT NULL, "apocalypseTypeId" TEXT, "bunkerLocationTypeId" TEXT);
CREATE TABLE "LobbyPlayer" ("id" TEXT PRIMARY KEY, "lobbyId" TEXT NOT NULL, "userId" TEXT NOT NULL, "status" "LobbyPlayerStatus" NOT NULL, "lastSeenAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "reconnectDeadline" TIMESTAMP, UNIQUE("lobbyId","userId"));
CREATE TABLE "BannedUser" ("id" TEXT PRIMARY KEY, "twitchNick" TEXT UNIQUE NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "SiteChatMessage" ("id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "message" TEXT NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "ChatFilterWord" ("id" TEXT PRIMARY KEY, "word" TEXT UNIQUE NOT NULL);

ALTER TABLE "LobbyPlayer" ADD FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id");
ALTER TABLE "LobbyPlayer" ADD FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "SiteChatMessage" ADD FOREIGN KEY ("userId") REFERENCES "User"("id");
