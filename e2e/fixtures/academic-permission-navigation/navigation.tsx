import React, { useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
};

export const navigate = (url: string, replace = false) => {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const usePathname = () => useSyncExternalStore(subscribe, () => window.location.pathname);
export const useSearchParams = () => new URLSearchParams(useSyncExternalStore(subscribe, () => window.location.search));
export const useParams = () => ({});
export const useRouter = () => ({
  push: (url: string) => navigate(url),
  replace: (url: string) => navigate(url, true),
  back: () => window.history.back(),
});

type FixtureLinkProps = React.ComponentProps<'a'> & { scroll?: boolean; prefetch?: boolean };
export default React.forwardRef<HTMLAnchorElement, FixtureLinkProps>((
  { scroll, prefetch, onClick, href, children, ...props }, ref
) => <a {...props} href={href} ref={ref} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented && event.button === 0 && href) {
      event.preventDefault();
      navigate(href);
    }
  }}>{children}</a>);
