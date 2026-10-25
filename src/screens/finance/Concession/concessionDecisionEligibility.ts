/** Administrators may decide their own requests; action grants and server eligibility still apply. */
export const canDecideConcession = (
  currentUserId: string | null | undefined,
  requesterId: string | null | undefined,
  submittedById?: string | null,
  isAdministrator = false
): boolean =>
  Boolean(
    currentUserId &&
    requesterId &&
    (isAdministrator ||
      (currentUserId.toLowerCase() !== requesterId.toLowerCase() &&
        (!submittedById || currentUserId.toLowerCase() !== submittedById.toLowerCase())))
  );
