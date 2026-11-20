import type { AnchorHTMLAttributes } from 'react';

import { forwardRef, useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
};
const navigate = (url: string, replace = false) => {
  const target = new URL(url, window.location.origin);
  if (target.origin !== window.location.origin)
    throw new Error('Fixture navigation must stay local.');
  window.history[replace ? 'replaceState' : 'pushState'](null, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
export const usePathname = () => useSyncExternalStore(subscribe, () => window.location.pathname);
export const useSearchParams = () =>
  new URLSearchParams(useSyncExternalStore(subscribe, () => window.location.search));
export const useParams = () => ({});
export const useRouter = () => ({
  push: navigate,
  replace: (url: string) => navigate(url, true),
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh() {},
  prefetch() {},
});
export default forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    replace?: boolean;
    prefetch?: boolean;
    scroll?: boolean;
  }
>(
  (
    { href = '#', children, onClick, replace, prefetch: _prefetch, scroll: _scroll, ...props },
    ref
  ) => (
    <a
      {...props}
      ref={ref}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          navigate(href, replace);
        }
      }}
    >
      {children}
    </a>
  )
);
