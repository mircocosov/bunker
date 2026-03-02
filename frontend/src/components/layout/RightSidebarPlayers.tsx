import { UiPlayer } from '../../types/ui';
import { PlayersPanel } from '../panels/PlayersPanel';

export function RightSidebarPlayers({ players, isAdmin }: { players: UiPlayer[]; isAdmin?: boolean }) {
  return (
    <div className="h-full min-h-0">
      <PlayersPanel players={players} votingEnabled isAdmin={isAdmin} />
    </div>
  );
}
