import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameSessionService, RoomSceneMode } from './game-session.service';
import { TraitCategory } from '../admin-traits/admin-traits.service';

class CreateRoomDto {
  sceneMode!: RoomSceneMode;
  sceneId?: number;
}

class JoinGameDto {
  nickname!: string;
}

class RevealTraitDto {
  nickname!: string;
  category!: TraitCategory;
}

class VoteDto {
  voter!: string;
  target!: string;
}

class FinishVoteDto {
  twitchVotes?: number[];
}

class UseActionCardDto {
  nickname!: string;
  cardId!: number;
}

class FinishGameDto {
  survivors!: string[];
}

@Controller()
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @Post('admin/game/create-room')
  createRoom(@Body() body: CreateRoomDto) {
    return this.gameSessionService.createRoom(body.sceneMode, body.sceneId);
  }

  @Get('admin/game/state')
  getState() {
    return this.gameSessionService.getState();
  }

  @Post('game/join')
  join(@Body() body: JoinGameDto) {
    return this.gameSessionService.join(body.nickname);
  }

  @Post('admin/game/start')
  start() {
    return this.gameSessionService.start();
  }

  @Post('admin/game/reveal-round/start')
  startRevealRound() {
    return this.gameSessionService.startRevealRound();
  }

  @Post('game/reveal-trait')
  revealTrait(@Body() body: RevealTraitDto) {
    return this.gameSessionService.revealTrait(body.nickname, body.category);
  }

  @Post('admin/game/vote/start')
  startVoteRound() {
    return this.gameSessionService.startVoteRound();
  }

  @Post('game/vote')
  vote(@Body() body: VoteDto) {
    return this.gameSessionService.vote(body.voter, body.target);
  }

  @Post('admin/game/vote/finish')
  finishVoteRound(@Body() body: FinishVoteDto) {
    return this.gameSessionService.finishVoteRound(body.twitchVotes ?? []);
  }

  @Post('game/action-cards/use')
  useActionCard(@Body() body: UseActionCardDto) {
    return this.gameSessionService.useActionCard(body.nickname, body.cardId);
  }

  @Post('admin/game/finish')
  finishGame(@Body() body: FinishGameDto) {
    return this.gameSessionService.finishGame(body.survivors);
  }
}
