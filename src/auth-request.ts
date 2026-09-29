const inFlightAuthRequests = new Map<string, Promise<unknown>>();

/**
 * Reuses an in-flight authentication request with the same key.
 *
 * NextAuth can evaluate the same session concurrently (for example when
 * several server components load together). Without this guard, identical
 * token requests race each other and can trigger OpenIddict concurrency
 * failures while it persists authorizations and refresh tokens.
 */
export function runAuthRequestOnce<T>(key: string, request: () => Promise<T>): Promise<T> {
  const existingRequest = inFlightAuthRequests.get(key) as Promise<T> | undefined;
  if (existingRequest) {
    return existingRequest;
  }

  const pendingRequest = Promise.resolve()
    .then(request)
    .finally(() => {
      if (inFlightAuthRequests.get(key) === pendingRequest) {
        inFlightAuthRequests.delete(key);
      }
    });

  inFlightAuthRequests.set(key, pendingRequest);
  return pendingRequest;
}
