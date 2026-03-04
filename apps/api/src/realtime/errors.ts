export class RoomNotFoundError extends Error {
  readonly code = 'ROOM_NOT_FOUND';
  constructor(public readonly roomId: string) {
    super('ROOM_NOT_FOUND');
  }
}
