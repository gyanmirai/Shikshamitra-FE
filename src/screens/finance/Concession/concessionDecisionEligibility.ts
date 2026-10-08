/** The requester's immutable identity is required before any decision is offered. */
export const canDecideConcession = (
  currentUserId: string | null | undefined,
  requesterId: string | null | undefined,
  submittedById?: string | null
): boolean =>
  Boolean(
    currentUserId &&
      requesterId &&
      currentUserId.toLowerCase() !== requesterId.toLowerCase() &&
      (!submittedById || currentUserId.toLowerCase() !== submittedById.toLowerCase())
  );
