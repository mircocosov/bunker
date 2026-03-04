import { Injectable } from '@nestjs/common';
import { RoomNotFoundError } from './errors';

export interface RoomRuntimeState {
  roomId: string;
  users: Set<string>;
  readyUsers: Set<string>;
  status: 'waiting' | 'ready_check';
  eventSeq: number;
}

@Injectable()
export class RoomRegistryService {
  private readonly rooms = new Map<string, RoomRuntimeState>();

  join(roomId: string, userId: string): RoomRuntimeState {
    const state = this.rooms.get(roomId) ?? {
      roomId,
      users: new Set<string>(),
      readyUsers: new Set<string>(),
      status: 'waiting',
      eventSeq: 0,
    };

    state.users.add(userId);
    state.eventSeq += 1;
    this.rooms.set(roomId, state);
    return state;
  }

  ready(roomId: string, userId: string): RoomRuntimeState {
    const state = this.rooms.get(roomId);
    if (!state) {
      throw new RoomNotFoundError(roomId);
    }

    state.readyUsers.add(userId);
    state.status = 'ready_check';
    state.eventSeq += 1;
    return state;
  }

  // TODO(iteration3): persist room runtime in Redis/Postgres snapshots.
}
