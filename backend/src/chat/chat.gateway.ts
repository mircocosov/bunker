import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, path: '/bunker/socket.io' })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;
  constructor(private jwt: JwtService, private chat: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      const payload = this.jwt.verify(token);
      client.data.user = payload;
      client.join('lobby');
      const history = await this.chat.history();
      client.emit('chat:history', history);
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:send')
  async send(@ConnectedSocket() client: Socket, @MessageBody() body: { message: string }) {
    const saved = await this.chat.send(client.data.user.userId, body.message);
    this.server.to('lobby').emit('chat:newMessage', saved);
  }
}
