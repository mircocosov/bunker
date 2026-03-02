declare module 'tmi.js' {
  export type ChatUserstate = {
    username?: string;
    'display-name'?: string;
    [key: string]: any;
  };

  export type Options = {
    options?: { debug?: boolean };
    connection?: { reconnect?: boolean; secure?: boolean };
    channels?: string[];
    identity?: { username: string; password: string };
  };

  export class Client {
    constructor(opts: Options);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    on(
      event: 'message',
      cb: (channel: string, tags: ChatUserstate, message: string, self: boolean) => void | Promise<void>,
    ): void;
  }

  const tmi: { Client: typeof Client };
  export default tmi;
}
