import { useSyncExternalStore } from 'react';
const subscribe = (listener: () => void) => {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
};
const navigate = (url: string, replace = false) => {
  window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
export const useRouter = () => ({
  push: (url: string) => navigate(url),
  replace: (url: string) => navigate(url, true),
  back: () => window.history.back(),
  refresh: () => {},
  prefetch: async () => {},
});
export const usePathname = () => window.location.pathname;
export const useSearchParams = () =>
  new URLSearchParams(useSyncExternalStore(subscribe, () => window.location.search));
export const useParams = () => ({});
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];
export const redirect = () => {};
export const notFound = () => {};
