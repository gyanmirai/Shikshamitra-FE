import { useSyncExternalStore } from 'react';
export * from '../cash-management/mock-navigation';
const subscribe = (listener: () => void) => {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
};
export const usePathname = () => useSyncExternalStore(subscribe, () => window.location.pathname);
