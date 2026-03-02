export type PlayerStatus = 'ALIVE' | 'KICKED' | 'SPECTATOR';

export type RevealedField = {
  type: 'health' | 'phobia' | 'profession' | 'hobby' | 'luggage' | 'fact';
  value: string;
};

export type UiPlayer = {
  id: string;
  number: number;
  nick: string;
  status: PlayerStatus;
  revealed: RevealedField[];
};

export type UiMessage = {
  id: string;
  nick: string;
  text: string;
  time: string;
};

export type SceneLayerKind = 'SKY' | 'MID' | 'GROUND' | 'FOREGROUND';

export type SceneLayerUi = {
  id: string;
  kind: SceneLayerKind;
  assetKey: string;
  zIndex: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  repeatX?: boolean;
};
