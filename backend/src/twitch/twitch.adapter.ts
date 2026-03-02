export interface ChatMessage {
  senderNick: string;
  message: string;
}

export interface TwitchDebugState {
  channel: string | null;
  connected: boolean;
  lastMessageAt: string | null;
  lastSenderNick: string | null;
}

export interface TwitchChatAdapter {
  onMessage(handler: (msg: ChatMessage) => Promise<void> | void): void;
  connectAndListen(): Promise<void>;
  disconnect(): Promise<void>;
  getDebugState(): TwitchDebugState;
}

export const TWITCH_ADAPTER = Symbol('TWITCH_ADAPTER');
