import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AdminTraitsService, TraitCategory, TraitRecord } from '../admin-traits/admin-traits.service';
import { AdminScenesService } from '../admin-scenes/admin-scenes.service';
import { ActionCardRecord, AdminActionCardsService } from '../admin-action-cards/admin-action-cards.service';
import { ChatFilterService } from '../chat-filter/chat-filter.service';
import { SettingsService } from '../settings/settings.service';
import { BlacklistService } from '../blacklist/blacklist.service';
import { CharacterService } from '../character/character.service';

export type RoomSceneMode = 'random' | 'fixed';

type GameStatus = 'lobby' | 'started';

interface PlayerTraitState {
  category: TraitCategory;
  value: string;
  revealed: boolean;
}

interface PlayerProfileState {
  nickname: string;
  sex: 'male' | 'female';
  age: number;
  traits: PlayerTraitState[];
}

interface RevealRoundState {
  round: number;
  endsAt: string;
  pendingNicknames: string[];
}

interface VoteRecord {
  voter: string;
  target: string;
}

interface VoteTally {
  target: string;
  votes: number;
  voters: string[];
}

interface VoteRoundState {
  round: number;
  endsAt: string;
  votes: VoteRecord[];
  tally: VoteTally[];
  tieCandidates?: string[];
  kickedNickname?: string;
}

interface BunkerUpgradeRecord {
  nickname: string;
  cardId: number;
  description: string;
}

interface GameSnapshot {
  settings: ReturnType<SettingsService['get']>;
  traits: ReturnType<AdminTraitsService['list']>;
  scenes: ReturnType<AdminScenesService['list']>;
  actionCards: ReturnType<AdminActionCardsService['list']>;
  chatFilter: ReturnType<ChatFilterService['list']>;
  selectedScene: number | 'random';
}

export interface GlobalGameState {
  id: string;
  status: GameStatus;
  createdAt: string;
  players: string[];
  alivePlayers: string[];
  observers: string[];
  minPlayersToStart: number;
  sceneMode: RoomSceneMode;
  sceneId?: number;
  snapshot?: GameSnapshot;
  round: number;
  revealRound?: RevealRoundState;
  voteRound?: VoteRoundState;
  playerProfiles: PlayerProfileState[];
  playerActionCards: Record<string, ActionCardRecord[]>;
  bunkerUpgrades: BunkerUpgradeRecord[];
}

@Injectable()
export class GameSessionService {
  private currentGame: GlobalGameState | null = null;
  private revealRoundTimer: NodeJS.Timeout | null = null;
  private voteRoundTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly traitsService: AdminTraitsService,
    private readonly scenesService: AdminScenesService,
    private readonly actionCardsService: AdminActionCardsService,
    private readonly chatFilterService: ChatFilterService,
    private readonly blacklistService: BlacklistService,
    private readonly characterService: CharacterService,
  ) {}

  createRoom(sceneMode: RoomSceneMode, sceneId?: number): GlobalGameState {
    if (this.currentGame) {
      throw new ConflictException('A global game already exists');
    }

    const settings = this.settingsService.get();
    this.currentGame = {
      id: randomUUID(),
      status: 'lobby',
      createdAt: new Date().toISOString(),
      players: [],
      alivePlayers: [],
      observers: [],
      minPlayersToStart: settings.minPlayersToStart,
      sceneMode,
      sceneId,
      round: 0,
      playerProfiles: [],
      playerActionCards: {},
      bunkerUpgrades: [],
    };

    return this.currentGame;
  }

  getState(): GlobalGameState {
    if (!this.currentGame) {
      throw new NotFoundException('No active global game');
    }

    return this.currentGame;
  }

  join(nickname: string): GlobalGameState {
    if (!this.currentGame) {
      throw new NotFoundException('No active global game');
    }
    if (this.currentGame.status !== 'lobby') {
      throw new ConflictException('Registration is closed');
    }
    if (this.blacklistService.isBanned(nickname)) {
      throw new ConflictException('BANNED_OBSERVER_ONLY');
    }

    if (!this.currentGame.players.includes(nickname)) {
      this.currentGame.players.push(nickname);
    }

    return this.currentGame;
  }

  start(): GlobalGameState {
    if (!this.currentGame) {
      throw new NotFoundException('No active global game');
    }
    if (this.currentGame.status !== 'lobby') {
      throw new ConflictException('Game already started');
    }
    if (this.currentGame.players.length < this.currentGame.minPlayersToStart) {
      throw new ConflictException('Not enough players to start');
    }

    const selectedScene = this.currentGame.sceneMode === 'fixed' && this.currentGame.sceneId ? this.currentGame.sceneId : 'random';
    const snapshot = {
      settings: { ...this.settingsService.get() },
      traits: [
        ...this.traitsService.list('profession'),
        ...this.traitsService.list('phobia'),
        ...this.traitsService.list('hobby'),
        ...this.traitsService.list('luggage'),
        ...this.traitsService.list('fact'),
        ...this.traitsService.list('health'),
      ],
      scenes: [...this.scenesService.list()],
      actionCards: [...this.actionCardsService.list()],
      chatFilter: [...this.chatFilterService.list()],
      selectedScene,
    };

    const playerActionCards: Record<string, ActionCardRecord[]> = {};
    for (const nickname of this.currentGame.players) {
      playerActionCards[nickname] = this.drawPlayerActionCards(snapshot.actionCards, 2);
    }

    this.currentGame = {
      ...this.currentGame,
      status: 'started',
      alivePlayers: [...this.currentGame.players],
      observers: [],
      snapshot,
      playerProfiles: this.currentGame.players.map((nickname) => this.generatePlayerProfile(nickname)),
      playerActionCards,
    };

    return this.currentGame;
  }

  startRevealRound(): GlobalGameState {
    const game = this.requireStartedGame();
    if (game.revealRound) {
      throw new ConflictException('Reveal round already active');
    }

    const pendingNicknames = game.playerProfiles
      .filter((profile) => game.alivePlayers.includes(profile.nickname) && profile.traits.some((trait) => !trait.revealed))
      .map((profile) => profile.nickname);

    if (pendingNicknames.length === 0) {
      throw new ConflictException('All traits are already revealed');
    }

    const nextRound = game.round + 1;
    const revealDurationSec = game.snapshot?.settings.revealDurationSec ?? 60;
    const endsAtMs = Date.now() + revealDurationSec * 1000;

    this.currentGame = {
      ...game,
      round: nextRound,
      revealRound: {
        round: nextRound,
        endsAt: new Date(endsAtMs).toISOString(),
        pendingNicknames,
      },
    };

    this.revealRoundTimer = setTimeout(() => {
      this.autoRevealPendingTraits();
    }, Math.max(0, endsAtMs - Date.now()));

    return this.currentGame;
  }

  revealTrait(nickname: string, category: TraitCategory): GlobalGameState {
    const game = this.requireStartedGame();
    if (!game.revealRound) {
      throw new ConflictException('Reveal round is not active');
    }

    const profile = game.playerProfiles.find((item) => item.nickname === nickname);
    if (!profile || !game.alivePlayers.includes(nickname)) {
      throw new NotFoundException('Player not found');
    }
    if (!game.revealRound.pendingNicknames.includes(nickname)) {
      throw new ConflictException('Player already revealed this round');
    }

    const trait = profile.traits.find((item) => item.category === category);
    if (!trait) {
      throw new NotFoundException('Trait not found for player');
    }
    if (trait.revealed) {
      throw new ConflictException('Trait already revealed');
    }

    trait.revealed = true;
    const pendingNicknames = game.revealRound.pendingNicknames.filter((item) => item !== nickname);

    this.currentGame = {
      ...game,
      playerProfiles: [...game.playerProfiles],
      revealRound: pendingNicknames.length > 0 ? { ...game.revealRound, pendingNicknames } : undefined,
    };

    if (pendingNicknames.length === 0) {
      this.clearRevealTimer();
    }

    return this.currentGame;
  }

  startVoteRound(): GlobalGameState {
    const game = this.requireStartedGame();
    if (game.voteRound && !game.voteRound.kickedNickname && !game.voteRound.tieCandidates) {
      throw new ConflictException('Vote round already active');
    }

    const voteDurationSec = game.snapshot?.settings.voteDurationSec ?? 60;
    const endsAtMs = Date.now() + voteDurationSec * 1000;

    this.currentGame = {
      ...game,
      voteRound: {
        round: game.round,
        endsAt: new Date(endsAtMs).toISOString(),
        votes: [],
        tally: this.buildTally([], game.alivePlayers),
      },
    };

    this.voteRoundTimer = setTimeout(() => {
      this.finishVoteRound();
    }, Math.max(0, endsAtMs - Date.now()));

    return this.currentGame;
  }

  vote(voter: string, target: string): GlobalGameState {
    const game = this.requireStartedGame();
    if (!game.voteRound) {
      throw new ConflictException('Vote round is not active');
    }

    if (!game.alivePlayers.includes(voter) || !game.alivePlayers.includes(target)) {
      throw new ConflictException('Only alive players can vote for alive players');
    }

    if (game.voteRound.votes.some((item) => item.voter === voter)) {
      return game;
    }

    const votes = [...game.voteRound.votes, { voter, target }];
    this.currentGame = {
      ...game,
      voteRound: {
        ...game.voteRound,
        votes,
        tally: this.buildTally(votes, game.alivePlayers),
      },
    };

    return this.currentGame;
  }

  finishVoteRound(twitchVotes: number[] = []): GlobalGameState {
    const game = this.requireStartedGame();
    if (!game.voteRound) {
      throw new ConflictException('Vote round is not active');
    }

    this.clearVoteTimer();
    const voteRound = game.voteRound;
    const tieCandidates = this.getTopCandidates(voteRound.tally);

    if (tieCandidates.length === 0) {
      throw new ConflictException('No votes in round');
    }

    const kickedNickname = this.resolveKickFromCandidates(tieCandidates, twitchVotes);

    this.currentGame = {
      ...game,
      alivePlayers: game.alivePlayers.filter((item) => item !== kickedNickname),
      observers: game.observers.includes(kickedNickname) ? game.observers : [...game.observers, kickedNickname],
      voteRound: {
        ...voteRound,
        tieCandidates: tieCandidates.length > 1 ? tieCandidates : undefined,
        kickedNickname,
      },
    };

    return this.currentGame;
  }


  finishGame(survivors: string[]): { finished: true; survivors: string[]; bunkerSlots: number; gameId: string } {
    const game = this.requireStartedGame();
    const bunkerSlots = game.snapshot?.settings.bunkerSlots ?? 0;

    if (survivors.length !== bunkerSlots) {
      throw new ConflictException('Survivors count must match bunker slots');
    }

    const uniqueSurvivors = new Set(survivors);
    if (uniqueSurvivors.size !== survivors.length) {
      throw new ConflictException('Survivors must be unique');
    }

    for (const nickname of survivors) {
      if (!game.alivePlayers.includes(nickname)) {
        throw new NotFoundException(`Survivor ${nickname} is not alive in current game`);
      }
      this.characterService.addBunkerWin(nickname);
    }

    this.clearRevealTimer();
    this.clearVoteTimer();
    this.currentGame = null;

    return {
      finished: true,
      gameId: game.id,
      survivors,
      bunkerSlots,
    };
  }

  useActionCard(nickname: string, cardId: number): GlobalGameState {
    const game = this.requireStartedGame();
    if (!game.alivePlayers.includes(nickname)) {
      throw new ConflictException('Only alive players can use action cards');
    }

    const cards = game.playerActionCards[nickname] ?? [];
    const selectedCard = cards.find((item) => item.id === cardId);
    if (!selectedCard) {
      throw new NotFoundException('Action card not found for player');
    }

    const remainingCards = cards.filter((item) => item.id !== cardId);
    const nextPlayerCards = {
      ...game.playerActionCards,
      [nickname]: remainingCards,
    };

    const bunkerUpgrades = selectedCard.scope === 'bunker_upgrade'
      ? [...game.bunkerUpgrades, { nickname, cardId: selectedCard.id, description: selectedCard.description }]
      : game.bunkerUpgrades;

    this.currentGame = {
      ...game,
      playerActionCards: nextPlayerCards,
      bunkerUpgrades,
    };

    return this.currentGame;
  }

  private resolveKickFromCandidates(candidates: string[], twitchVotes: number[]): string {
    if (candidates.length === 1) {
      return candidates[0];
    }

    const indexedCandidates = candidates.map((targetNickname, index) => ({ index: index + 1, targetNickname }));
    const counts = new Map<string, number>();

    for (const vote of twitchVotes) {
      const matched = indexedCandidates.find((candidate) => candidate.index === vote);
      if (!matched) {
        continue;
      }
      counts.set(matched.targetNickname, (counts.get(matched.targetNickname) ?? 0) + 1);
    }

    if (counts.size > 0) {
      const maxVotes = Math.max(...counts.values());
      const leaders = Array.from(counts.entries())
        .filter(([, value]) => value === maxVotes)
        .map(([targetNickname]) => targetNickname);

      if (leaders.length === 1) {
        return leaders[0];
      }
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private getTopCandidates(tally: VoteTally[]): string[] {
    const activeTargets = tally.filter((item) => item.votes > 0);
    if (activeTargets.length === 0) {
      return [];
    }

    const maxVotes = Math.max(...activeTargets.map((item) => item.votes));
    return activeTargets.filter((item) => item.votes === maxVotes).map((item) => item.target);
  }

  private buildTally(votes: VoteRecord[], alivePlayers: string[]): VoteTally[] {
    return alivePlayers.map((target) => {
      const voters = votes.filter((item) => item.target === target).map((item) => item.voter);
      return {
        target,
        votes: voters.length,
        voters,
      };
    });
  }

  private drawPlayerActionCards(cards: ActionCardRecord[], amount: number): ActionCardRecord[] {
    if (cards.length === 0) {
      return [];
    }

    const deck = [...cards];
    const result: ActionCardRecord[] = [];
    while (result.length < amount && deck.length > 0) {
      const index = Math.floor(Math.random() * deck.length);
      const [card] = deck.splice(index, 1);
      if (card) {
        result.push(card);
      }
    }

    return result;
  }

  private requireStartedGame(): GlobalGameState {
    if (!this.currentGame) {
      throw new NotFoundException('No active global game');
    }
    if (this.currentGame.status !== 'started') {
      throw new ConflictException('Game is not started');
    }

    return this.currentGame;
  }

  private autoRevealPendingTraits(): void {
    if (!this.currentGame?.revealRound) {
      return;
    }

    const pending = [...this.currentGame.revealRound.pendingNicknames];
    for (const nickname of pending) {
      const profile = this.currentGame.playerProfiles.find((item) => item.nickname === nickname);
      if (!profile) {
        continue;
      }
      const hiddenTraits = profile.traits.filter((trait) => !trait.revealed);
      if (hiddenTraits.length === 0) {
        continue;
      }

      const randomTrait = hiddenTraits[Math.floor(Math.random() * hiddenTraits.length)];
      randomTrait.revealed = true;
    }

    this.currentGame = {
      ...this.currentGame,
      playerProfiles: [...this.currentGame.playerProfiles],
      revealRound: undefined,
    };
    this.clearRevealTimer();
  }

  private clearRevealTimer(): void {
    if (this.revealRoundTimer) {
      clearTimeout(this.revealRoundTimer);
      this.revealRoundTimer = null;
    }
  }

  private clearVoteTimer(): void {
    if (this.voteRoundTimer) {
      clearTimeout(this.voteRoundTimer);
      this.voteRoundTimer = null;
    }
  }

  private generatePlayerProfile(nickname: string): PlayerProfileState {
    const traits = this.buildInitialTraits();
    return {
      nickname,
      sex: Math.random() > 0.5 ? 'male' : 'female',
      age: 18 + Math.floor(Math.random() * 61),
      traits,
    };
  }

  private buildInitialTraits(): PlayerTraitState[] {
    const categories: TraitCategory[] = ['profession', 'phobia', 'hobby', 'luggage', 'fact', 'health'];
    return categories.map((category) => ({
      category,
      value: this.pickTraitValue(this.traitsService.list(category)),
      revealed: false,
    }));
  }

  private pickTraitValue(records: TraitRecord[]): string {
    if (records.length === 0) {
      return 'Unknown';
    }

    return records[Math.floor(Math.random() * records.length)]?.value ?? 'Unknown';
  }
}
