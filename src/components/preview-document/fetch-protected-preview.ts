import {
  getCachedAuthSession,
  isAuthSessionCacheCurrent,
  getAuthSessionCacheRevision,
} from 'src/redux/session-cache';

export async function fetchProtectedPreview(url: string, signal: AbortSignal): Promise<Blob> {
  const apiRoot = process.env.NEXT_PUBLIC_API_URL || '';
  const requestUrl = /^(https?:)?\/\//i.test(url)
    ? url
    : `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
  const allowedOrigin = new URL(apiRoot || window.location.origin, window.location.origin).origin;
  if (new URL(requestUrl, window.location.origin).origin !== allowedOrigin)
    throw new Error('Document URL is outside the API.');
  const revision = getAuthSessionCacheRevision();
  const session = await getCachedAuthSession();
  if (!isAuthSessionCacheCurrent(revision, session?.accessToken))
    throw new Error('The authentication session changed.');
  const headers = new Headers();
  if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);
  const response = await fetch(requestUrl, {
    credentials: 'include',
    headers,
    signal,
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Document request failed with ${response.status}`);
  const blob = await response.blob();
  if (!isAuthSessionCacheCurrent(revision, session?.accessToken))
    throw new Error('The authentication session changed.');
  return blob;
}
