import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { clientEvents } from '@bunker/shared';
import { RoomRegistryService } from './room-registry.service';
import { RoomNotFoundError } from './errors';
import { ActionDedupeService } from './action-dedupe.service';
import { ChatFilterService } from '../chat-filter/chat-filter.service';
import { BlacklistService } from '../blacklist/blacklist.service';

@WebSocketGateway({ namespace: '/rooms', cors: { origin: '*' } })
export class RoomsGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly roomRegistry: RoomRegistryService,
    private readonly actionDedupe: ActionDedupeService,
    private readonly chatFilterService: ChatFilterService,
    private readonly blacklistService: BlacklistService,
  ) {}

  private dedupeKey(userId: string, actionId: string) {
    return `${userId}:${actionId}`;
  }

  @SubscribeMessage('room.join')
  handleJoin(@MessageBody() payload: unknown, @ConnectedSocket() socket: Socket) {
    const parsed = clientEvents.roomJoin.safeParse(payload);
    if (!parsed.success) {
      socket.emit('system.warning', { event: 'system.warning', message: 'Invalid room.join payload' });
      return;
    }

    const userId = socket.data.userId ?? socket.id;
    if (this.blacklistService.isBanned(userId)) {
      socket.emit('system.warning', {
        event: 'system.warning',
        message: 'BANNED_OBSERVER_ONLY',
        details: { nickname: userId },
      });
      return;
    }
    const key = this.dedupeKey(userId, parsed.data.action_id);
    if (this.actionDedupe.isDuplicate(key)) {
      return;
    }

    const room = this.roomRegistry.join(parsed.data.roomCode, userId);
    this.actionDedupe.markSeen(key);
    socket.join(parsed.data.roomCode);

    this.server.to(parsed.data.roomCode).emit('room.state_updated', {
      event: 'room.state_updated',
      roomId: room.roomId,
      status: room.status,
      event_seq: room.eventSeq,
      players_count: room.users.size,
    });
  }

  @SubscribeMessage('room.ready')
  handleReady(@MessageBody() payload: unknown, @ConnectedSocket() socket: Socket) {
    const parsed = clientEvents.roomReady.safeParse(payload);
    if (!parsed.success) {
      socket.emit('system.warning', { event: 'system.warning', message: 'Invalid room.ready payload' });
      return;
    }

    const userId = socket.data.userId ?? socket.id;
    const key = this.dedupeKey(userId, parsed.data.action_id);
    if (this.actionDedupe.isDuplicate(key)) {
      return;
    }

    try {
      const room = this.roomRegistry.ready(parsed.data.roomId, userId);
      this.actionDedupe.markSeen(key);

      this.server.to(parsed.data.roomId).emit('room.state_updated', {
        event: 'room.state_updated',
        roomId: room.roomId,
        status: room.status,
        event_seq: room.eventSeq,
        ready_count: room.readyUsers.size,
        players_count: room.users.size,
      });
    } catch (error) {
      if (error instanceof RoomNotFoundError) {
        socket.emit('system.warning', {
          event: 'system.warning',
          message: 'ROOM_NOT_FOUND',
          details: { roomId: error.roomId },
        });
        return;
      }
      throw error;
    }
  }

  @SubscribeMessage('match.chat_send')
  handleChatSend(@MessageBody() payload: unknown, @ConnectedSocket() socket: Socket) {
    const parsed = clientEvents.chatSend.safeParse(payload);
    if (!parsed.success) {
      socket.emit('system.warning', { event: 'system.warning', message: 'Invalid match.chat_send payload' });
      return;
    }

    const maskedText = this.chatFilterService.maskText(parsed.data.text);

    this.server.emit('match.chat_message', {
      event: 'match.chat_message',
      match_id: parsed.data.match_id,
      user_id: socket.data.userId ?? socket.id,
      text: maskedText,
    });
  }
}
