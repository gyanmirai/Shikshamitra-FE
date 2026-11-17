import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

export function useSearchParams() {
  return new URLSearchParams(useSyncExternalStore(subscribe, () => window.location.search));
}

export function usePathname() {
  return '/student/setup';
}

export function useParams() {
  return {};
}

export function useRouter() {
  return {
    back() { window.history.back(); },
    forward() { window.history.forward(); },
    refresh() {},
    prefetch() {},
    replace(path: string) {
      window.history.replaceState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    },
    push(path: string) {
      if (path.startsWith('/student/setup?')) {
        window.history.pushState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else window.location.assign(path);
    },
  };
}
