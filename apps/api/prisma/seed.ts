import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.gameRuleSet.create({
    data: {
      name: 'classic_ru',
      version: 1,
      mode: 'classic',
      roomType: 'public',
      localeScope: 'ru',
      schemaVersion: 1,
      rulesJson: {
        schema_version: 1,
        players: { min: 8, max: 12 },
        timers: { reveal_sec: 45, discussion_sec: 180, vote_sec: 40 },
      },
      stateMachineJson: {
        schema_version: 1,
        startState: 'ROOM_WAITING',
        endStates: ['MATCH_FINISHED'],
        states: ['ROOM_WAITING', 'ROUND_REVEAL', 'ROUND_VOTING', 'MATCH_FINISHED'],
        transitions: [{ from: 'ROOM_WAITING', action: 'start', to: 'ROUND_REVEAL' }],
      },
      status: 'published',
    },
  });

  await prisma.cardDefinition.createMany({
    data: [
      {
        id: 'card_prof_doctor_v1',
        category: 'profession',
        titleJson: { ru: 'Врач' },
        weight: 20,
        rarity: 'common',
        powerScore: 8,
        status: 'published',
      },
      {
        id: 'card_hobby_runner_v1',
        category: 'hobby',
        titleJson: { ru: 'Бегун' },
        weight: 15,
        rarity: 'common',
        powerScore: 4,
        status: 'published',
      },
    ],
  });
}

main().finally(() => prisma.$disconnect());
