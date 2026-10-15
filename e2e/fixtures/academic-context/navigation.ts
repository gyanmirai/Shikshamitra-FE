import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => window.location.pathname);
