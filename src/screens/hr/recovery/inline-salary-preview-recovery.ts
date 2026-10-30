// Request ownership only: never store salary inputs, errors, identities or form drafts here.
const claims = new Map<string, { route: string }>();

/** The template editor presents supported preview failures inline until this request settles. */
export function claimInlineSalaryPreviewRecovery(requestId: string | undefined): () => void {
  if (!requestId || typeof window === 'undefined') return () => {};
  if (claims.size >= 100) claims.clear();
  const claim = { route: window.location.pathname + window.location.search };
  claims.set(requestId, claim);
  return () => {
    if (claims.get(requestId) === claim) claims.delete(requestId);
  };
}

export function takeInlineSalaryPreviewRecovery(requestId: string, route: string): boolean {
  const claim = claims.get(requestId);
  claims.delete(requestId);
  return claim?.route === route;
}
