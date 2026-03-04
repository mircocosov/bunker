-- CreateTable
CREATE TABLE "GameRules" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bunkerCapacity" INTEGER NOT NULL,
    "discussionDurationSec" INTEGER NOT NULL,
    "votingDurationSec" INTEGER NOT NULL,
    "openCharacteristicDurationSec" INTEGER NOT NULL,
    "initialRevealedCount" INTEGER NOT NULL,
    "revealOrder" JSONB NOT NULL,
    "actionCardsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "canUseActionCardAfterReveal" BOOLEAN NOT NULL DEFAULT true,
    "winCondition" TEXT NOT NULL,
    "finalRoundLimit" INTEGER,

    CONSTRAINT "GameRules_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Lobby" ADD COLUMN "gameRulesId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GameRules_key_key" ON "GameRules"("key");

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_gameRulesId_fkey" FOREIGN KEY ("gameRulesId") REFERENCES "GameRules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed a default classic ruleset as the single source of truth.
INSERT INTO "GameRules" (
    "id",
    "key",
    "title",
    "description",
    "bunkerCapacity",
    "discussionDurationSec",
    "votingDurationSec",
    "openCharacteristicDurationSec",
    "initialRevealedCount",
    "revealOrder",
    "actionCardsEnabled",
    "canUseActionCardAfterReveal",
    "winCondition",
    "finalRoundLimit"
) VALUES (
    gen_random_uuid()::text,
    'bunker_classic',
    'Bunker Classic',
    'Каноничный набор правил Бункера с возможностью кастомизации через админку.',
    6,
    120,
    60,
    30,
    1,
    '["profession", "health", "hobby", "luggage", "phobia", "fact1", "fact2"]'::jsonb,
    true,
    true,
    'survive_until_capacity',
    NULL
)
ON CONFLICT ("key") DO NOTHING;
