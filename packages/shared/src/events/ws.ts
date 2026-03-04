import { z } from 'zod';

export const clientEvents = {
  roomJoin: z.object({ event: z.literal('room.join'), action_id: z.string(), roomCode: z.string() }),
  roomReady: z.object({ event: z.literal('room.ready'), action_id: z.string(), roomId: z.string() }),
  revealAttribute: z.object({
    event: z.literal('match.reveal_attribute'),
    action_id: z.string(),
    match_id: z.string(),
    attribute: z.string(),
  }),
  chatSend: z.object({ event: z.literal('match.chat_send'), action_id: z.string(), match_id: z.string(), text: z.string() }),
  voteCast: z.object({
    event: z.literal('match.vote_cast'),
    action_id: z.string(),
    match_id: z.string(),
    target_user_id: z.string(),
  }),
  requestSync: z.object({
    event: z.literal('match.request_sync'),
    action_id: z.string(),
    match_id: z.string(),
    last_event_seq: z.number().int().nonnegative(),
  }),
};

export const serverEvents = {
  roomStateUpdated: z.object({
    event: z.literal('room.state_updated'),
    roomId: z.string(),
    status: z.string(),
    event_seq: z.number().int().nonnegative(),
    players_count: z.number().int().nonnegative().optional(),
    ready_count: z.number().int().nonnegative().optional(),
  }),
  matchStateChanged: z.object({ event: z.literal('match.state_changed'), match_id: z.string(), state: z.string(), round: z.number() }),
  matchTimerTick: z.object({ event: z.literal('match.timer_tick'), match_id: z.string(), deadline_ts: z.string() }),
  matchPlayerUpdated: z.object({ event: z.literal('match.player_updated'), match_id: z.string(), player_id: z.string() }),
  matchVoteResult: z.object({ event: z.literal('match.vote_result'), match_id: z.string(), round: z.number() }),
  matchFinished: z.object({ event: z.literal('match.finished'), match_id: z.string(), result: z.record(z.string(), z.any()) }),
  systemWarning: z.object({ event: z.literal('system.warning'), message: z.string() }),
};
