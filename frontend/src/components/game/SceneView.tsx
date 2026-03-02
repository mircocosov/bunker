import { CSSProperties } from 'react';
import { PixelRunner } from '../PixelRunner';
import { SceneLayerUi, UiPlayer } from '../../types/ui';

type Props = {
  players: UiPlayer[];
  layers: SceneLayerUi[];
  groundYPercent?: number;
  showGroundLine?: boolean;
};

export function SceneView({ players, layers, groundYPercent = 74, showGroundLine = false }: Props) {
  const alive = players.filter((p) => p.status === 'ALIVE');
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  const groundYpx = `${groundYPercent}%`;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#334155,#0f172a_50%,#020617)]" />

      {sortedLayers.map((layer) => (
        <img
          key={layer.id}
          src={layer.assetKey}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            zIndex: layer.zIndex,
            transform: `translate(${layer.offsetX ?? 0}px, ${layer.offsetY ?? 0}px) scale(${layer.scale ?? 1})`,
          } as CSSProperties}
        />
      ))}

      {showGroundLine && <div className="absolute inset-x-0 h-px bg-lime-300/90" style={{ top: groundYpx, zIndex: 999 }} />}

      <div className="absolute inset-x-0" style={{ top: `calc(${groundYpx} - 24px)`, zIndex: 1000 }}>
        {alive.map((p, i) => <PixelRunner key={p.id} name={p.nick} i={i} />)}
      </div>
    </div>
  );
}
