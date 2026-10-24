import { useMemo, useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};
const navigate = (path: string, replace = false) => {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
const router = { push: (path: string) => navigate(path), replace: (path: string) => navigate(path, true), back: () => window.history.back(), forward: () => window.history.forward(), refresh: () => {}, prefetch: () => {} };
export const useRouter = () => router;
export const usePathname = () => useSyncExternalStore(subscribe, () => window.location.pathname);
export const useSearchParams = () => {
  const search = useSyncExternalStore(subscribe, () => window.location.search);
  return useMemo(() => new URLSearchParams(search), [search]);
};
export const useParams = () => ({});
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];
