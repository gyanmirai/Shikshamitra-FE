import React, { useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
};
const navigate = (url: string, replace = false) => {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export function useSearchParams() {
  const search = useSyncExternalStore(subscribe, () => window.location.search);
  return new URLSearchParams(search);
}
export function usePathname() {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}
export function useRouter() {
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, true),
    back: () => window.history.back(),
  };
}
export function redirect(url: string) {
  navigate(url);
}
type FixtureLinkProps = React.ComponentProps<'a'> & { scroll?: boolean; prefetch?: boolean };
export default React.forwardRef<HTMLAnchorElement, FixtureLinkProps>(function FixtureLink(
  { scroll, prefetch, onClick, ...props },
  ref
) {
  return (
    <a
      ref={ref}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          props.target === '_blank' ||
          !props.href
        )
          return;
        event.preventDefault();
        navigate(props.href);
      }}
    />
  );
});
