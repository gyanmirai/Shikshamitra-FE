import { pointerWithin, rectIntersection, type CollisionDetection } from '@dnd-kit/core';

function removeActiveSeat<T extends { id: string | number }>(
  collisions: T[],
  activeSeatId?: string
) {
  return collisions.filter((collision) => collision.id !== `seat:${activeSeatId}`);
}

export const manualCollisionDetection: CollisionDetection = (args) => {
  const activeSeatId = (
    args.active.data.current as { seat?: { seatId?: string } } | undefined
  )?.seat?.seatId;
  const pointerCollisions = removeActiveSeat(pointerWithin(args), activeSeatId);
  return pointerCollisions.length > 0
    ? pointerCollisions
    : removeActiveSeat(rectIntersection(args), activeSeatId);
};
