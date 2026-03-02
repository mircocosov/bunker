export interface ChatMessage {
  senderNick: string;
  message: string;
}

export interface TwitchChatAdapter {
  onMessage(handler: (msg: ChatMessage) => Promise<void> | void): void;
  start(): Promise<void>;
}

export const TWITCH_ADAPTER = Symbol('TWITCH_ADAPTER');
