import { useMemo, useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  window.addEventListener('fixture-navigation', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('fixture-navigation', callback);
  };
}

const router = {
  push(href: string) {
    window.history.pushState(null, '', href);
    window.dispatchEvent(new Event('fixture-navigation'));
  },
  replace(href: string) {
    window.history.replaceState(null, '', href);
    window.dispatchEvent(new Event('fixture-navigation'));
  },
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => {},
  prefetch: () => {},
};

export const useRouter = () => router;
export const usePathname = () => window.location.pathname;
export const useParams = () => ({});
export function useSearchParams() {
  const search = useSyncExternalStore(subscribe, () => window.location.search);
  return useMemo(() => new URLSearchParams(search), [search]);
}
