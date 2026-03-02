import { UiMessage } from '../../types/ui';
import { ChatPanel } from '../panels/ChatPanel';

type Props = {
  messages: UiMessage[];
  onSend: (text: string) => void;
  cooldownMs: number;
  cooldownUntil: number;
  connectionError: string | null;
  sendError: string | null;
};

export function LeftSidebarChat(props: Props) {
  return (
    <div className="h-full min-h-0">
      <ChatPanel {...props} />
    </div>
  );
}
